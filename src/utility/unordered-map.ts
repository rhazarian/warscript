import { UnsupportedOperationException } from "../exception"

type OneSidedTypeGuard = {
    readonly __oneSidedTypeGuard: unique symbol
}

export interface ReadonlyUnorderedMap<K extends AnyNotNil, V> extends LuaPairsIterable<K, V> {
    get(key: K): V | undefined
    contains(key: AnyNotNil): key is K & OneSidedTypeGuard
    readonly size: number
}

export interface UnorderedMap<K extends AnyNotNil, V> extends LuaPairsIterable<K, V> {
    readonly __unorderedMap: unique symbol
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UnorderedMap<K extends AnyNotNil, V> implements ReadonlyUnorderedMap<K, V> {
    private readonly v = new LuaMap<K, V>()
    private s = 0

    public get(key: K): V | undefined {
        return this.v.get(key)
    }

    public getOrPut(key: K, defaultValue: (this: void) => V): V {
        let value = this.v.get(key)
        if (value !== undefined) {
            return value
        }
        value = defaultValue()
        this.v.set(key, value)
        ++this.s
        return value
    }

    public put(key: K, value: V): void {
        if (!this.v.has(key)) {
            this.v.set(key, value)
            ++this.s
        }
    }

    public remove(key: K): boolean {
        if (this.v.has(key)) {
            this.v.delete(key)
            --this.s
            return true
        }
        return false
    }

    public contains(key: AnyNotNil): key is K & OneSidedTypeGuard {
        return this.v.has(key as K)
    }

    public get size(): number {
        return this.s
    }

    protected __len(): number {
        return this.s
    }

    protected __pairs(this: UnorderedMap<K, V>): ReturnType<typeof pairs> {
        return pairs(this.v)
    }
}

class EmptyUnorderedMap extends UnorderedMap<never, never> {
    public override getOrPut(): never {
        throw new UnsupportedOperationException()
    }

    public override put(): never {
        throw new UnsupportedOperationException()
    }

    public override remove(): never {
        throw new UnsupportedOperationException()
    }

    protected __len(): number {
        return 0
    }

    protected __pairs(this: EmptyUnorderedMap): ReturnType<typeof pairs> {
        return pairs(this["v"])
    }
}

const EMPTY_UNORDERED_MAP = new EmptyUnorderedMap()

export const emptyUnorderedMap = <K extends AnyNotNil, V>(): ReadonlyUnorderedMap<K, V> => {
    return EMPTY_UNORDERED_MAP as any
}

export const mutableUnorderedMap = <K extends AnyNotNil, V>(): UnorderedMap<K, V> => {
    return new UnorderedMap()
}
