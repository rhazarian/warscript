import { sortBy } from "./arrays"
import { UnsupportedOperationException } from "../exception"
import { NonEmptyArray, ReadonlyNonEmptyArray } from "./types"

type IteratorState<T extends AnyNotNil> = {
    t: LuaMap<T, T>
    n?: T
}

const linkedSetNext = <T extends AnyNotNil>(state: IteratorState<T>): T | undefined => {
    const n = state.n
    state.n = state.t.get(n!)
    return n
}

type OneSidedTypeGuard = {
    readonly __oneSidedTypeGuard: unique symbol
}

export interface ReadonlyLinkedSet<T extends AnyNotNil> extends LuaPairsKeyIterable<T> {
    copyOf(): LinkedSet<T>
    first(): T | undefined
    last(): T | undefined
    next(key: T): T | undefined
    previous(key: T): T | undefined
    contains(key: AnyNotNil): key is T & OneSidedTypeGuard
    size: number
    forEach<Args extends any[]>(action: (value: T, ...args: Args) => void, ...args: Args): void
    toArray(): T[]
    sumOf(selector: ((value: T) => number) | KeysOfType<T, number>): number
}

export interface ReadonlyNonEmptyLinkedSet<T extends AnyNotNil> extends ReadonlyLinkedSet<T> {
    first(): T
    last(): T
    toArray(): NonEmptyArray<T>
}

export interface LinkedSet<T extends AnyNotNil> extends LuaPairsKeyIterable<T> {
    readonly __linkedSet: unique symbol
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class LinkedSet<T extends AnyNotNil> implements ReadonlyLinkedSet<T> {
    private n = new LuaMap<T, T>()
    private p = new LuaMap<T, T>()
    private f?: T
    private l?: T
    private s = 0

    public copyOf(): LinkedSet<T> {
        const copy = new LinkedSet<T>()
        const n = copy.n
        for (const [key, value] of this.n) {
            n.set(key, value)
        }
        const p = copy.p
        for (const [key, value] of this.p) {
            p.set(key, value)
        }
        copy.f = this.f
        copy.l = this.l
        copy.s = this.s
        return copy
    }

    public first(): T | undefined {
        return this.f
    }

    public last(): T | undefined {
        return this.l
    }

    public next(key: T): T | undefined {
        return this.n.get(key)
    }

    public previous(key: T): T | undefined {
        return this.p.get(key)
    }

    public add(key: T): boolean {
        const n = this.n
        if (n.has(key)) {
            return false
        }
        const l = this.l
        if (l === undefined) {
            this.f = key
            this.l = key
            this.s = 1
        } else if (l !== key) {
            n.set(l, key)
            this.p.set(key, l)
            this.l = key
            this.s = this.s + 1
        } else {
            return false
        }
        return true
    }

    public remove(key: T): boolean {
        const n = this.n
        const next = n.get(key)
        n.delete(key)
        const p = this.p
        const previous = p.get(key)
        p.delete(key)
        if (next !== undefined && previous !== undefined) {
            n.set(previous, next)
            p.set(next, previous)
        } else if (next !== undefined) {
            this.f = next
            p.delete(next)
        } else if (previous !== undefined) {
            this.l = previous
            n.delete(previous)
        } else if (this.l == key) {
            this.f = undefined
            this.l = undefined
        } else {
            return false
        }
        this.s = this.s - 1
        return true
    }

    public contains(key: AnyNotNil): key is T & OneSidedTypeGuard {
        return this.n.has(key as any) || this.l === key
    }

    public clear(): void {
        this.n = new LuaMap<T, T>()
        this.p = new LuaMap<T, T>()
        this.f = undefined
        this.l = undefined
        this.s = 0
    }

    public get size(): number {
        return this.s
    }

    public forEach<Args extends any[]>(
        action: (value: T, ...args: Args) => void,
        ...args: Args
    ): void {
        const n = this.n
        let c = this.f
        while (c !== undefined) {
            action(c, ...args)
            c = n.get(c)
        }
    }

    public toArray(): T[] {
        const array: T[] = []
        let i = 1
        const n = this.n
        let c = this.f
        while (c !== undefined) {
            array[i - 1] = c
            i++
            c = n.get(c)
        }
        return array
    }

    public sumOf(selector: ((value: T) => number) | KeysOfType<T, number>): number {
        let sum = 0
        const n = this.n
        let c = this.f
        if (typeof selector == "function") {
            while (c !== undefined) {
                sum += selector(c)
                c = n.get(c)
            }
        } else {
            while (c !== undefined) {
                sum += c[selector] as number
                c = n.get(c)
            }
        }
        return sum
    }

    public sortBy<R>(selector: ((value: T) => R) | KeysOfType<T, R>): void {
        // TODO: make it stable!

        const array = this.toArray()
        sortBy(array, selector)
        const n = this.n
        const p = this.p
        const s = this.s
        for (const i of $range(1, s)) {
            n.set(array[i - 1], array[i])
            p.set(array[i - 1], array[i - 2])
        }
        this.f = array[0]
        this.l = array[s - 1]
    }

    protected __pairs(this: LinkedSet<T>): LuaIterator<T | undefined, IteratorState<T>> {
        return $multi(
            linkedSetNext,
            {
                t: this.n,
                n: this.f,
            },
            undefined,
        )
    }
}

class EmptyLinkedSet extends LinkedSet<never> {
    override add(): boolean {
        throw new UnsupportedOperationException()
    }
}

const EMPTY_LINKED_SET = new EmptyLinkedSet()

export const emptyLinkedSet = <T extends AnyNotNil>(): ReadonlyLinkedSet<T> => {
    return EMPTY_LINKED_SET as any
}

export const mutableLinkedSetOf = <T extends AnyNotNil>(
    ...elements: ReadonlyArray<T>
): LinkedSet<T> => {
    const linkedSet = new LinkedSet<T>()
    for (const i of $range(1, select("#", ...elements))) {
        linkedSet.add(select(i, ...elements)[0])
    }
    return linkedSet
}

export const mutableLinkedSetOfNotNull = <T extends AnyNotNil>(
    ...elements: readonly (T | undefined | null)[]
): LinkedSet<T> => {
    const linkedSet = new LinkedSet<T>()
    for (const i of $range(1, select("#", ...elements))) {
        const element = select(i, ...elements)[0]
        if (element != undefined) {
            linkedSet.add(element)
        }
    }
    return linkedSet
}

export const linkedSetOf = <T extends AnyNotNil>(
    ...elements: ReadonlyArray<T>
): ReadonlyLinkedSet<T> => mutableLinkedSetOf(...elements) as ReadonlyLinkedSet<T>

export const linkedSetOfNotNull = <T extends AnyNotNil>(
    ...elements: ReadonlyArray<T>
): ReadonlyLinkedSet<T> => mutableLinkedSetOfNotNull(...elements) as ReadonlyLinkedSet<T>

export const nonEmptyLinkedSetOf = <T extends AnyNotNil>(
    ...elements: ReadonlyNonEmptyArray<T>
): ReadonlyNonEmptyLinkedSet<T> => linkedSetOf(...elements) as ReadonlyNonEmptyLinkedSet<T>
