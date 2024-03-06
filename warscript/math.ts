const pack = string.pack
const unpack = string.unpack

const intBitsToFloat = (intBits: number): number => unpack("<f", pack("<i4", intBits))[0]

const floatToIntBits = (float: number): number => unpack("<i4", pack("<f", float))[0]

export const MINIMUM_POSITIVE_NORMALIZED_FLOAT = intBitsToFloat(0x00800000)

export const MINIMUM_POSITIVE_FLOAT = intBitsToFloat(0x1)

export const MAXIMUM_INTEGER = 2147483647

export const MINIMUM_INTEGER = -2147483648

export const POSITIVE_INFINITY = math.huge

export const NEGATIVE_INFINITY = -math.huge

export const E = Math.E

export const LN10 = Math.LN10

export const LN2 = Math.LN2

export const LOG2E = Math.LOG2E

export const LOG10E = Math.LOG10E

export const PI = Math.PI

export const SQRT1_2 = Math.SQRT1_2

export const SQRT2 = Math.SQRT2

export const ceil = math.ceil

/** Clamps the value to fit between min and max. */
export const clamp = (value: number, min: number, max: number): number => {
    return value < min ? min : value > max ? max : value
}

export const abs = math.abs

export const cos = math.cos

export const exp = math.exp

export const floor = math.floor

export const log = math.log

export const max = math.max

export const min = math.min

/** Returns the signum function of the argument;
 * zero if the argument is zero,
 * 1.0 if the argument is greater than zero,
 * -1.0 if the argument is less than zero. */
export const signum = (value: number): number => {
    return value == 0 ? 0 : value > 0 ? 1.0 : -1.0
}

/** Returns the trigonometric sine of an angle (assumed to be in radians). */
export const sin = math.sin

/** Returns the positive square root of a value. */
export const sqrt = math.sqrt

export const nextUp = (value: number): number => {
    value = value.toFloat()
    if (value < POSITIVE_INFINITY) {
        // Add +0.0 to get rid of a -0.0 (+0.0 + -0.0 => +0.0).
        const transducer = floatToIntBits(value)
        return intBitsToFloat(transducer + (transducer >= 0 ? 1 : -1))
    } else {
        // f is NaN or +Infinity
        return value
    }
}

export const nextDown = (value: number): number => {
    value = value.toFloat()
    if (value != value || value == NEGATIVE_INFINITY) {
        return value
    } else if (value == 0) {
        return -MINIMUM_POSITIVE_FLOAT
    } else {
        return intBitsToFloat(floatToIntBits(value) + (value > 0 ? -1 : +1))
    }
}

export const nextAfter = (start: number, direction: number): number => {
    start = start.toFloat()
    direction = direction.toFloat()

    if (start > direction) {
        // descending
        if (start != 0.0) {
            const transducer = floatToIntBits(start)
            return intBitsToFloat(transducer + (transducer > 0 ? -1 : 1))
        } else {
            // start == 0.0f && direction < 0.0f
            return -MINIMUM_POSITIVE_FLOAT
        }
    } else if (start < direction) {
        // ascending
        const transducer = floatToIntBits(start)
        return intBitsToFloat(transducer + (transducer >= 0 ? 1 : -1))
    } else if (start == direction) {
        return direction
    } else {
        // isNaN(start) || isNaN(direction)
        return start + direction
    }
}
