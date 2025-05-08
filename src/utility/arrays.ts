import { IllegalArgumentException } from "../exception"
import { TupleOf } from "./types"

const mathMax = math.max
const mathMin = math.min
const select = _G.select
const tableConcat = table.concat
const tableSort = table.sort

const EMPTY_ARRAY: readonly any[] = []

export const emptyArray = <T>(): readonly T[] => {
    return EMPTY_ARRAY
}

export const joinToString = <T>(
    array: readonly T[],
    separator: string,
    transform: (element: T) => string = tostring,
): string => {
    return tableConcat(map(array, transform), separator)
}

export const arrayOfNotNull = <T>(...elements: readonly (T | undefined | null)[]): T[] => {
    const array: T[] = []
    let j = 1
    for (const i of $range(1, select("#", ...elements))) {
        const [value] = select(i, ...elements)
        if (value != undefined) {
            array[j - 1] = value
            ++j
        }
    }
    return array
}

export const array = <T, N extends number>(
    length: N,
    initialize: (index: number) => T,
): TupleOf<T, N> => {
    const result: T[] = []
    for (const i of $range(1, length)) {
        result[i - 1] = initialize(i - 1)
    }
    return result as TupleOf<T, N>
}

export const toLuaSet = <T extends AnyNotNil>(array: readonly T[]): LuaSet<T> => {
    const result = new LuaSet<T>()
    for (const i of $range(1, array.length)) {
        result.add(array[i - 1])
    }
    return result
}

export const forEach = <T, Args extends any[]>(
    array: readonly T[],
    consumerOrKey:
        | ((value: T, ...args: Args) => void)
        | KeysOfType<T, (this: T, ...args: Args) => void>,
    ...args: Args
): void => {
    if (typeof consumerOrKey == "function") {
        for (const i of $range(1, array.length)) {
            consumerOrKey(array[i - 1], ...args)
        }
    } else {
        for (const i of $range(1, array.length)) {
            ;(array[i - 1][consumerOrKey] as (this: T, ...args: Args) => void)(...args)
        }
    }
}

export const all: {
    <T>(array: readonly T[], transform: (value: T) => boolean): boolean
    <T>(array: readonly T[], key: KeysOfType<T, boolean>): boolean
} = <T>(
    array: readonly T[],
    transform: ((value: T) => boolean) | KeysOfType<T, boolean>,
): boolean => {
    let result = true
    if (typeof transform == "function") {
        for (const i of $range(1, array.length)) {
            result = result && transform(array[i - 1])
        }
    } else {
        for (const i of $range(1, array.length)) {
            result = result && (array[i - 1][transform] as boolean)
        }
    }
    return result
}

export const map: {
    <T, R>(array: readonly T[], transform: (value: T) => R): R[]
    <T, K extends keyof T>(array: readonly T[], key: K): T[K][]
} = <T, R>(array: readonly T[], transform: ((value: T) => R) | KeysOfType<T, R>): R[] => {
    const result: R[] = []
    if (typeof transform == "function") {
        for (const i of $range(1, array.length)) {
            result[i - 1] = transform(array[i - 1])
        }
    } else {
        for (const i of $range(1, array.length)) {
            result[i - 1] = array[i - 1][transform] as R
        }
    }
    return result
}

export const mapNotNull: {
    <T, R>(array: readonly T[], transform: (value: T) => R | null | undefined): NonNullable<R>[]
    <T, K extends keyof T>(array: readonly T[], key: K): NonNullable<T[K]>[]
} = <T, R>(
    array: readonly T[],
    transform: ((value: T) => R | null | undefined) | KeysOfType<T, R | null | undefined>,
): NonNullable<R>[] => {
    const result: NonNullable<R>[] = []
    let j = 1
    if (typeof transform == "function") {
        for (const i of $range(1, array.length)) {
            const value = transform(array[i - 1])
            if (value != undefined) {
                result[j - 1] = value
                ++j
            }
        }
    } else {
        for (const i of $range(1, array.length)) {
            const value = array[i - 1][transform] as R
            if (value != undefined) {
                result[j - 1] = value
                ++j
            }
        }
    }
    return result
}

export const mapToLuaSet: {
    <T, R extends AnyNotNil>(array: readonly T[], transform: (value: T) => R): LuaSet<R>
    <T, K extends KeysOfType<T, AnyNotNil>>(
        array: readonly T[],
        key: K,
    ): LuaSet<T[K] extends AnyNotNil ? T[K] : never>
} = <T, R extends AnyNotNil>(
    array: readonly T[],
    transform: ((value: T) => R) | KeysOfType<T, R>,
): LuaSet<R> => {
    const result = new LuaSet<R>()
    if (typeof transform == "function") {
        for (const i of $range(1, array.length)) {
            result.add(transform(array[i - 1]))
        }
    } else {
        for (const i of $range(1, array.length)) {
            result.add(array[i - 1][transform] as R)
        }
    }
    return result
}

export const flatMap: {
    <T, R>(array: readonly T[], transform: (value: T) => readonly R[]): R[]
    <T, K extends KeysOfType<T, readonly any[]>>(
        array: readonly T[],
        key: K,
    ): (T[K] extends readonly (infer R)[] ? R : never)[]
} = <T, R>(
    array: readonly T[],
    transform: ((value: T) => readonly R[]) | KeysOfType<T, R[]>,
): R[] => {
    const result: R[] = []
    let k = 1
    if (typeof transform == "function") {
        for (const i of $range(1, array.length)) {
            const values = transform(array[i - 1])
            for (const j of $range(1, values.length)) {
                result[k - 1] = values[j - 1]
                ++k
            }
        }
    } else {
        for (const i of $range(1, array.length)) {
            const values = array[i - 1][transform] as readonly R[]
            for (const j of $range(1, values.length)) {
                result[k - 1] = values[j - 1]
                ++k
            }
        }
    }
    return result
}

export const flatMapToLuaSet: {
    <T, R extends AnyNotNil>(array: readonly T[], transform: (value: T) => readonly R[]): LuaSet<R>
    <T, K extends KeysOfType<T, readonly AnyNotNil[]>>(
        array: readonly T[],
        key: K,
    ): LuaSet<T[K] extends readonly (infer R extends AnyNotNil)[] ? R : never>
} = <T, R extends AnyNotNil>(
    array: readonly T[],
    transform: ((value: T) => readonly R[]) | KeysOfType<T, R[]>,
): LuaSet<R> => {
    const result = new LuaSet<R>()
    if (typeof transform == "function") {
        for (const i of $range(1, array.length)) {
            const values = transform(array[i - 1])
            for (const j of $range(1, values.length)) {
                result.add(values[j - 1])
            }
        }
    } else {
        for (const i of $range(1, array.length)) {
            const values = array[i - 1][transform] as readonly R[]
            for (const j of $range(1, values.length)) {
                result.add(values[j - 1])
            }
        }
    }
    return result
}

export const mapIndexed = <T, R>(
    array: readonly T[],
    transform: (index: number, value: T) => R,
): R[] => {
    const result: R[] = []
    for (const i of $range(1, array.length)) {
        result[i - 1] = transform(i - 1, array[i - 1])
    }
    return result
}

export const associate = <T, K extends AnyNotNil, V>(
    array: readonly T[],
    keySelector: (value: T) => K,
    valueSelector: (value: T) => V,
): LuaMap<K, V> => {
    const result = new LuaMap<K, V>()
    for (const i of $range(1, array.length)) {
        const element = array[i - 1]
        result.set(keySelector(element), valueSelector(element))
    }
    return result
}

export const associateBy: {
    <K extends AnyNotNil, V>(array: readonly V[], keySelector: (value: V) => K): LuaMap<K, V>
    <K extends KeysOfType<V, AnyNotNil>, V>(
        array: readonly V[],
        keySelector: K,
    ): LuaMap<V[K] extends AnyNotNil ? V[K] : never, V>
} = <K extends AnyNotNil, V>(
    array: readonly V[],
    keySelector: ((value: V) => K) | KeysOfType<V, K>,
): LuaMap<K, V> => {
    const result = new LuaMap<K, V>()
    if (typeof keySelector == "function") {
        for (const i of $range(1, array.length)) {
            const value = array[i - 1]
            result.set(keySelector(value), value)
        }
    } else {
        for (const i of $range(1, array.length)) {
            const value = array[i - 1]
            result.set(value[keySelector] as K, value)
        }
    }
    return result
}

export const associateByIndexed = <K extends AnyNotNil, V>(
    array: readonly V[],
    keySelector: (index: number, value: V) => K,
): LuaMap<K, V> => {
    const result = new LuaMap<K, V>()
    for (const i of $range(1, array.length)) {
        const value = array[i - 1]
        result.set(keySelector(i - 1, value), value)
    }
    return result
}

export const associateWith = <K extends AnyNotNil, V>(
    array: readonly K[],
    valueSelector: (value: K) => V,
): LuaMap<K, V> => {
    const result = new LuaMap<K, V>()
    for (const i of $range(1, array.length)) {
        const value = array[i - 1]
        result.set(value, valueSelector(value))
    }
    return result
}

export const associateWithIndexed = <K extends AnyNotNil, V>(
    array: readonly K[],
    valueSelector: (index: number, value: K) => V,
): LuaMap<K, V> => {
    const result = new LuaMap<K, V>()
    for (const i of $range(1, array.length)) {
        const value = array[i - 1]
        result.set(value, valueSelector(i - 1, value))
    }
    return result
}

export const filter = <T>(array: readonly T[], predicate: (value: T) => boolean): T[] => {
    const result: T[] = []
    let j = 1
    for (const i of $range(1, array.length)) {
        const value = array[i - 1]
        if (predicate(value)) {
            result[j - 1] = value
            ++j
        }
    }
    return result
}

export const average = (array: readonly number[]): number => {
    let sum = 0
    const count = array.length
    for (const i of $range(1, count)) {
        sum += array[i - 1]
    }
    return count == 0 ? 0 / 0 : sum / count
}

export const sum = (array: readonly number[]): number => {
    let sum = 0
    for (const i of $range(1, array.length)) {
        sum += array[i - 1]
    }
    return sum
}

export const product = (array: readonly number[]): number => {
    let product = 1
    for (const i of $range(1, array.length)) {
        product *= array[i - 1]
    }
    return product
}

export const max = (array: readonly number[]): number => {
    if (array.length == 0) {
        throw new IllegalArgumentException()
    }
    return mathMax(...(array as [number, ...number[]]))
}

export const maxBy: {
    <T, Args extends any[]>(
        array: readonly T[],
        selector: (value: T, ...args: Args) => number,
        ...args: Args
    ): T | undefined
    <T, K extends KeysOfType<T, number>>(array: readonly T[], key: K): T | undefined
} = <T, Args extends any[]>(
    array: readonly T[],
    selector: ((value: T, ...args: Args) => number) | KeysOfType<T, number>,
    ...args: Args
): T | undefined => {
    let result: T | undefined = undefined
    let maxValue: number = -math.huge
    if (typeof selector == "function") {
        for (const i of $range(1, array.length)) {
            const element = array[i - 1]
            const value = selector(element, ...args)
            if (value > maxValue) {
                result = element
                maxValue = value
            }
        }
    } else {
        for (const i of $range(1, array.length)) {
            const element = array[i - 1]
            const value = element[selector] as number
            if (value > maxValue) {
                result = element
                maxValue = value
            }
        }
    }
    return result
}

export const intersperse = <T>(array: readonly T[], delimiter: T): T[] => {
    const result: T[] = []
    const length = array.length
    for (const i of $range(1, length - 1)) {
        result[i + i - 1 - 1] = array[i - 1]
        result[i + i - 1] = delimiter
    }
    result[length + length - 1 - 1] = array[length - 1]
    return result
}

export const zip = <T, R, V>(
    array: readonly T[],
    otherArray: readonly R[],
    transform: (value: T, otherValue: R) => V,
): V[] => {
    const result: V[] = []
    for (const i of $range(1, mathMin(array.length, otherArray.length))) {
        result[i - 1] = transform(array[i - 1], otherArray[i - 1])
    }
    return result
}

export const chunked = <T>(array: readonly T[], size: number): T[][] => {
    if (size <= 0) {
        throw new IllegalArgumentException(`Size ${size} must be greater than zero.`)
    }

    const chunks: T[][] = []
    let chunkCount = 0

    let chunk: T[] = []
    let chunkSize = 0
    for (const i of $range(1, array.length)) {
        ++chunkSize
        chunk[chunkSize - 1] = array[i - 1]
        if (chunkSize >= size) {
            ++chunkCount
            chunks[chunkCount - 1] = chunk
            chunk = []
            chunkSize = 0
        }
    }
    if (chunkSize != 0) {
        chunks[chunkCount] = chunk
    }

    return chunks
}

let comparePropertyKey: any
const compareByProperty = (a: any, b: any): boolean => {
    return a[comparePropertyKey] < b[comparePropertyKey]
}

let compareSelector: (value: any) => any
const compareBySelector = <T>(a: T, b: T): boolean => {
    return compareSelector(a) < compareSelector(b)
}

export const sortBy = <T, R>(array: T[], selector: ((value: T) => R) | KeysOfType<T, R>): void => {
    if (typeof selector == "function") {
        compareSelector = selector
        tableSort(array, compareBySelector)
    } else {
        comparePropertyKey = selector
        tableSort(array, compareByProperty)
    }
}

export const sortedBy: {
    <T, R>(array: readonly T[], selector: (value: T) => R): T[]
    <T, K extends keyof T>(array: readonly T[], key: K): T[]
} = <T, R>(array: readonly T[], selector: ((value: T) => R) | KeysOfType<T, R>): T[] => {
    const sortedArray: T[] = [...array]
    if (typeof selector == "function") {
        compareSelector = selector
        tableSort(sortedArray, compareBySelector)
    } else {
        comparePropertyKey = selector
        tableSort(sortedArray, compareByProperty)
    }
    return sortedArray
}

export const partition: {
    <T>(array: readonly T[], predicate: (value: T) => boolean): LuaMultiReturn<[T[], T[]]>
    <T, K extends KeysOfType<T, boolean>>(array: readonly T[], key: K): LuaMultiReturn<[T[], T[]]>
} = <T>(
    array: readonly T[],
    predicate: ((value: T) => boolean) | KeysOfType<T, boolean>,
): LuaMultiReturn<[T[], T[]]> => {
    const first: T[] = []
    let firstLength = 0
    const second: T[] = []
    let secondLength = 0

    if (typeof predicate == "function") {
        for (const i of $range(1, array.length)) {
            const value = array[i - 1]
            if (predicate(value)) {
                firstLength++
                first[firstLength - 1] = value
            } else {
                secondLength++
                second[secondLength - 1] = value
            }
        }
    } else {
        for (const i of $range(1, array.length)) {
            const value = array[i - 1]
            if (value[predicate]) {
                firstLength++
                first[firstLength - 1] = value
            } else {
                secondLength++
                second[secondLength - 1] = value
            }
        }
    }

    return $multi(first, second)
}

export const distinct = <T extends AnyNotNil>(array: readonly T[]): T[] => {
    const result: T[] = []
    let j = 1
    const luaSet = new LuaSet<T>()
    for (const i of $range(1, array.length)) {
        const element = array[i - 1]
        if (!luaSet.has(element)) {
            luaSet.add(element)
            result[j - 1] = element
            ++j
        }
    }
    return result
}
