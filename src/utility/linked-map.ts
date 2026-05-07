import { LinkedSet, ReadonlyLinkedSet } from "./linked-set"
import { UnsupportedOperationException } from "../exception"

type IteratorState<K extends AnyNotNil, V> = {
    n?: K
    t: LuaMap<K, K>
    v: LuaMap<K, V>
}

const linkedMapNext = <K extends AnyNotNil, V>(
    state: IteratorState<K, V>,
): LuaMultiReturn<[K | undefined, V | undefined]> => {
    const n = state.n
    state.n = state.t.get(n!)
    return $multi(n, state.v.get(n!))
}

type OneSidedTypeGuard = {
    readonly __oneSidedTypeGuard: unique symbol
}

export interface ReadonlyLinkedMap<K extends AnyNotNil, V> extends LuaPairsIterable<K, V> {
    readonly keys: ReadonlyLinkedSet<K>
    get(key: K): V | undefined
    contains(key: AnyNotNil): key is K & OneSidedTypeGuard
    readonly size: number
}

export interface LinkedMap<K extends AnyNotNil, V> extends LuaPairsIterable<K, V> {
    readonly __linkedSet: unique symbol
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class LinkedMap<K extends AnyNotNil, V> implements ReadonlyLinkedMap<K, V> {
    private k = new LinkedSet<K>()
    private v = new LuaMap<K, V>()

    public get keys(): ReadonlyLinkedSet<K> {
        return this.k
    }

    public get(key: K): V | undefined {
        return this.v.get(key)
    }

    public getOrPut(key: K, defaultValue: (this: void) => V): V {
        let value = this.v.get(key)
        if (value !== undefined) {
            return value
        }
        value = defaultValue()
        this.k.add(key)
        this.v.set(key, value)
        return value
    }

    public put(key: K, value: V): void {
        this.k.add(key)
        this.v.set(key, value)
    }

    public remove(key: K): boolean {
        if (this.k.remove(key)) {
            this.v.delete(key)
            return true
        }
        return false
    }

    public contains(key: AnyNotNil): key is K & OneSidedTypeGuard {
        return this.keys.contains(key)
    }

    public get size(): number {
        return this.keys.size
    }

    protected __pairs(
        this: LinkedMap<K, V>,
    ): LuaIterator<LuaMultiReturn<[K | undefined, V | undefined]>, IteratorState<K, V>> {
        return $multi(
            linkedMapNext,
            {
                n: this.k["f"],
                t: this.k["n"],
                v: this.v,
            },
            undefined,
        )
    }
}

const emptyIteratorState: IteratorState<never, never> = {
    t: new LuaMap(),
    v: new LuaMap(),
}

class EmptyLinkedMap extends LinkedMap<never, never> {
    public override getOrPut(): never {
        throw new UnsupportedOperationException()
    }

    public override put(): never {
        throw new UnsupportedOperationException()
    }

    public override remove(): never {
        throw new UnsupportedOperationException()
    }

    protected __pairs(
        this: LinkedMap<never, never>,
    ): LuaIterator<LuaMultiReturn<[undefined, undefined]>, IteratorState<never, never>> {
        return $multi(linkedMapNext, emptyIteratorState, undefined)
    }
}

const EMPTY_LINKED_MAP = new EmptyLinkedMap()

export const emptyLinkedMap = <K extends AnyNotNil, V>(): ReadonlyLinkedMap<K, V> => {
    return EMPTY_LINKED_MAP as any
}

export const mutableLinkedMap = <K extends AnyNotNil, V>(): LinkedMap<K, V> => {
    return new LinkedMap()
}
