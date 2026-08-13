import { IllegalArgumentException } from "../exception"
import { MAXIMUM_INTEGER, PI, cos, sin, sqrt } from "../math"
import { ReadonlyNonEmptyArray } from "./types"

/*
 * Desync-safe ("asynchronous") randomness.
 *
 * Neither the Warcraft III random natives (`GetRandomInt`, `GetRandomReal`, ...) nor Lua's
 * `math.random` may be used in code that does not run on every client: their state is shared by
 * all clients and is expected to stay identical, so consuming a value on some clients only makes
 * every subsequent synchronous draw differ between clients, which desynchronizes the game.
 *
 * The generator implemented here is seeded from client-local entropy only, and its state lives
 * per client, so advancing it inside a local block is harmless. The flip side is that its values
 * differ between clients: they must never be allowed to reach synchronous state (issuing orders,
 * creating or damaging units, ...) — use them for purely local things such as visual effects,
 * sounds, UI and local timings.
 *
 * The generator itself is xoshiro128** (Blackman & Vigna), operating on four 32-bit words, seeded
 * by SplitMix32. All arithmetic is done on masked 32-bit values, so it never relies on the width
 * of Lua integers beyond them being 64-bit while intermediate results are computed.
 */

const clock = os.clock
const time = os.time

const byte = string.byte
const pack = string.pack
const unpack = string.unpack

const select = _G.select
const toString = _G.tostring
const globals = _G

const UINT32_MASK = 0xffffffff
const POW_2_32 = 0x100000000

/** 2^26, used to join two draws into a 53-bit mantissa. */
const POW_2_26 = 0x4000000

/** 2^53, the amount of representable values of a 53-bit mantissa. */
const POW_2_53 = 0x20000000000000

const GOLDEN_RATIO_32 = 0x9e3779b9

const FNV_PRIME_32 = 0x01000193

/** The SplitMix32 finalizer: avalanches a 32-bit value. */
const mix = (value: number): number => {
    let z = value & UINT32_MASK
    z = ((z ^ (z >>> 16)) * 0x21f0aaad) & UINT32_MASK
    z = ((z ^ (z >>> 15)) * 0x735a2d97) & UINT32_MASK
    return (z ^ (z >>> 15)) & UINT32_MASK
}

/** Folds the bytes of `value` into `hash` (FNV-1a). */
const hashString = (hash: number, value: string): number => {
    for (const i of $range(1, value.length)) {
        hash = ((hash ^ byte(value, i)) * FNV_PRIME_32) & UINT32_MASK
    }
    return hash
}

/** Folds the exact bit pattern of `value` into `hash`, without assuming it is an integer. */
const hashNumber = (hash: number, value: number): number => {
    const [low, high] = unpack("<i4i4", pack("<d", value))
    return mix(mix(hash ^ (low & UINT32_MASK)) ^ (high & UINT32_MASK))
}

let entropyCounter = 0

/**
 * Gathers 32 bits of client-local entropy.
 *
 * Every source is local by nature: the wall clock and the process CPU time drift apart between
 * machines, and the heap addresses of freshly allocated tables and of loaded code differ between
 * processes. The CPU time is read once more at the end, so that the time the gathering itself took
 * contributes as well.
 */
const collectEntropy = (): number => {
    let entropy = mix(GOLDEN_RATIO_32 ^ ++entropyCounter)
    entropy = mix(entropy ^ (time() & UINT32_MASK))
    entropy = hashNumber(entropy, clock())
    entropy = mix(hashString(entropy, toString({})))
    entropy = mix(hashString(entropy, toString({})))
    entropy = mix(hashString(entropy, toString(globals)))
    entropy = mix(hashString(entropy, toString(mix)))
    return hashNumber(entropy, clock())
}

/**
 * A client-local pseudorandom generator that is safe to advance inside a local block.
 *
 * Instances are independent of each other and of the game's synchronous randomness.
 */
export class AsyncRandom {
    private a = 0
    private b = 0
    private c = 0
    private d = 0

    /**
     * Creates a generator seeded with the given `seed`,
     * or with client-local entropy if no seed is given.
     */
    public constructor(seed?: number) {
        this.setSeed(seed ?? collectEntropy())
    }

    /** Resets the generator to the state defined by the given `seed`. */
    public setSeed(seed: number): void {
        let z = hashNumber(GOLDEN_RATIO_32, seed)

        z = (z + GOLDEN_RATIO_32) & UINT32_MASK
        const a = mix(z)
        z = (z + GOLDEN_RATIO_32) & UINT32_MASK
        const b = mix(z)
        z = (z + GOLDEN_RATIO_32) & UINT32_MASK
        const c = mix(z)
        z = (z + GOLDEN_RATIO_32) & UINT32_MASK
        const d = mix(z)

        this.a = a
        this.b = b
        this.c = c
        // The all-zero state is the single fixed point of the generator.
        this.d = (a | b | c | d) != 0 ? d : GOLDEN_RATIO_32
    }

    /**
     * Folds freshly gathered client-local entropy, optionally together with the given `value`,
     * into the current state.
     *
     * Useful to make streams of different clients diverge even further, e.g. by mixing in values
     * that are local by definition, such as the local player's id or the local mouse position.
     */
    public addEntropy(value?: number | string): void {
        let entropy = collectEntropy()
        if (typeof value == "number") {
            entropy = hashNumber(entropy, value)
        } else if (value != undefined) {
            entropy = hashString(entropy, value)
        }

        const a = this.a ^ mix(entropy)
        const b = this.b ^ mix(a)
        const c = this.c ^ mix(b)
        const d = this.d ^ mix(c)

        this.a = a
        this.b = b
        this.c = c
        this.d = (a | b | c | d) != 0 ? d : GOLDEN_RATIO_32

        this.next()
    }

    /** Advances the state and returns the next 32-bit word. */
    private next(): number {
        const a = this.a
        const b = this.b

        let result = (b * 5) & UINT32_MASK
        result = ((result << 7) | (result >>> 25)) & UINT32_MASK
        result = (result * 9) & UINT32_MASK

        const t = (b << 9) & UINT32_MASK
        const c = this.c ^ a
        const d = this.d ^ b

        this.a = a ^ d
        this.b = b ^ c
        this.c = c ^ t
        this.d = ((d << 11) | (d >>> 21)) & UINT32_MASK

        return result
    }

    /** Returns a uniformly distributed value in `[0, bound)`, where `bound` is in `[1, 2^32]`. */
    private nextBounded(bound: number): number {
        if (bound <= 1) {
            return 0
        }
        // Reject the incomplete tail of the 32-bit range to keep the distribution uniform.
        const limit = POW_2_32 - (POW_2_32 % bound)
        let value = this.next()
        while (value >= limit) {
            value = this.next()
        }
        return value % bound
    }

    /** Returns the given amount (`0` to `32`) of random bits as a non-negative integer. */
    public nextBits(bitCount: number): number {
        return this.next() >>> (32 - bitCount)
    }

    /**
     * Returns a uniformly distributed integer, both bounds being inclusive:
     * in `[0, upperBound]` when called with a single bound, in `[lowerBound, upperBound]` otherwise.
     */
    public nextInteger(upperBound?: number): number
    public nextInteger(lowerBound: number, upperBound: number): number
    public nextInteger(m?: number, n?: number): number {
        const lowerBound = n != undefined ? m! : 0
        const upperBound = n != undefined ? n : (m ?? MAXIMUM_INTEGER)
        if (upperBound < lowerBound) {
            throw new IllegalArgumentException(
                `Upper bound (${upperBound}) is less than lower bound (${lowerBound}).`,
            )
        }
        return lowerBound + this.nextBounded(upperBound - lowerBound + 1)
    }

    /**
     * Returns a uniformly distributed float with 53 bits of precision, the upper bound being
     * exclusive: in `[0, upperBound)` when called with a single bound,
     * in `[lowerBound, upperBound)` otherwise.
     */
    public nextFloat(upperBound?: number): number
    public nextFloat(lowerBound: number, upperBound: number): number
    public nextFloat(m?: number, n?: number): number {
        const high = this.next() >>> 5
        const low = this.next() >>> 6
        const value = (high * POW_2_26 + low) / POW_2_53
        return n != undefined ? m! + value * (n - m!) : value * (m ?? MAXIMUM_INTEGER)
    }

    /** Returns `true` with the given `probability`, or with a probability of one half by default. */
    public nextBoolean(probability?: number): boolean {
        return probability == undefined ? this.next() >>> 31 != 0 : this.nextFloat() < probability
    }

    /** Returns a uniformly distributed angle in degrees, in `[0, 360)`. */
    public nextAngle(): number {
        return this.nextFloat() * 360
    }

    /** Returns a uniformly distributed point within `range` of the given center. */
    public nextXY(
        centerX: number,
        centerY: number,
        range: number,
    ): LuaMultiReturn<[x: number, y: number]> {
        const r = range * sqrt(this.nextFloat())
        const t = this.nextFloat() * 2 * PI
        return $multi(centerX + r * cos(t), centerY + r * sin(t))
    }

    /** Returns a uniformly distributed element of the given `array`. */
    public nextElement<T>(array: ReadonlyNonEmptyArray<T>): T
    public nextElement<T>(array: ReadonlyArray<T>): T | undefined
    public nextElement<T>(array: ReadonlyArray<T>): T | undefined {
        const length = array.length
        return length != 0 ? array[this.nextBounded(length)] : undefined
    }

    /** Returns a uniformly distributed one of the given `elements`. */
    public nextOf<T>(element: T, ...elements: T[]): T
    public nextOf<T>(...elements: T[]): T | undefined
    public nextOf<T>(...elements: T[]): T | undefined {
        const count = select("#", ...elements)
        return count != 0 ? select(this.nextBounded(count) + 1, ...elements)[0] : undefined
    }

    /** Shuffles the given `array` in place, each permutation being equally likely. */
    public shuffle(array: unknown[]): void {
        for (const i of $range(array.length - 1, 1, -1)) {
            const j = this.nextBounded(i + 1)
            const value = array[i]
            array[i] = array[j]
            array[j] = value
        }
    }
}

let defaultAsyncRandom: AsyncRandom | undefined

const getDefaultAsyncRandom = (): AsyncRandom => {
    // Seeded on first use rather than on load: the later it happens, the more entropy is available.
    return (defaultAsyncRandom ??= new AsyncRandom())
}

/**
 * Folds freshly gathered client-local entropy, optionally together with the given `value`,
 * into the state of the generator backing the `asyncRandom*` functions.
 */
export const addAsyncRandomEntropy = (value?: number | string): void => {
    getDefaultAsyncRandom().addEntropy(value)
}

/** Returns the given amount (`0` to `32`) of random bits as a non-negative integer. */
export const asyncRandomBits = (bitCount: number): number => {
    return getDefaultAsyncRandom().nextBits(bitCount)
}

/**
 * Returns a uniformly distributed integer, both bounds being inclusive:
 * in `[0, upperBound]` when called with a single bound, in `[lowerBound, upperBound]` otherwise.
 */
export const asyncRandomInteger: {
    (upperBound?: number): number
    (lowerBound: number, upperBound: number): number
} = (m?: number, n?: number): number =>
    n != undefined
        ? getDefaultAsyncRandom().nextInteger(m!, n)
        : getDefaultAsyncRandom().nextInteger(m)

/**
 * Returns a uniformly distributed float with 53 bits of precision, the upper bound being exclusive:
 * in `[0, upperBound)` when called with a single bound, in `[lowerBound, upperBound)` otherwise.
 */
export const asyncRandomFloat: {
    (upperBound?: number): number
    (lowerBound: number, upperBound: number): number
} = (m?: number, n?: number): number =>
    n != undefined ? getDefaultAsyncRandom().nextFloat(m!, n) : getDefaultAsyncRandom().nextFloat(m)

/** Returns `true` with the given `probability`, or with a probability of one half by default. */
export const asyncRandomBoolean = (probability?: number): boolean => {
    return getDefaultAsyncRandom().nextBoolean(probability)
}

/** Returns a uniformly distributed angle in degrees, in `[0, 360)`. */
export const asyncRandomAngle = (): number => {
    return getDefaultAsyncRandom().nextAngle()
}

/** Returns a uniformly distributed point within `range` of the given center. */
export const asyncRandomXY = (
    centerX: number,
    centerY: number,
    range: number,
): LuaMultiReturn<[x: number, y: number]> => {
    return getDefaultAsyncRandom().nextXY(centerX, centerY, range)
}

/** Returns a uniformly distributed element of the given `array`. */
export const asyncRandomElement: {
    <T>(array: ReadonlyNonEmptyArray<T>): T
    <T>(array: ReadonlyArray<T>): T | undefined
} = <T>(array: ReadonlyArray<T>): T | undefined => {
    return getDefaultAsyncRandom().nextElement(array)
}

/** Returns a uniformly distributed one of the given `elements`. */
export const asyncRandom: {
    <T>(element: T, ...elements: T[]): T
    <T>(...elements: T[]): T | undefined
} = <T>(...elements: T[]): T | undefined => {
    return getDefaultAsyncRandom().nextOf(...elements)
}

/** Shuffles the given `array` in place, each permutation being equally likely. */
export const asyncShuffle = (array: unknown[]): void => {
    getDefaultAsyncRandom().shuffle(array)
}
