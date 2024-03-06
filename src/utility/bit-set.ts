interface IBitSet<T extends number> {
    readonly has: LuaBitwiseAndEqualsRightMethod<T>
    readonly hasAny: LuaBitwiseAndUnequalsZeroMethod<this>
    readonly intersect: LuaBitwiseAndMethod<this, this>
    readonly union: LuaBitwiseOrMethod<this, this>
    readonly with: LuaBitwiseOrMethod<T, this>
    readonly without: LuaBitwiseAndNotMethod<T, this>
}

/**
 * Typically, T should be a const enum, with each value being a power of two.
 */
export type BitSet<T extends number> = number & IBitSet<T>

export const emptyBitSet = <T extends number>(): BitSet<T> => {
    return 0 as BitSet<T>
}

export const bitSetOf = <T extends number>(...elements: T[]): BitSet<T> => {
    let bitSet = 0 as BitSet<T>
    for (const i of $range(1, select("#", ...elements))) {
        bitSet = bitSet.with(select(i, ...elements)[0])
    }
    return bitSet
}
