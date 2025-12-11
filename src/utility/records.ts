import { InvertRecordType } from "./types"

const pairs = _G.pairs
const tableSort = table.sort

export const invertRecord = <T extends Record<PropertyKey, PropertyKey | null | undefined>>(
    record: T,
): InvertRecordType<T> => {
    const invertRecord: Record<PropertyKey, PropertyKey> = {}
    for (const [key, value] of pairs(record)) {
        invertRecord[value] = key
    }
    return invertRecord as InvertRecordType<T>
}

const sortedKeysInternal: PropertyKey[] = []
let lastSortedKeysLength = 0

/** @internal For use by internal systems only. */
export const sortedKeysUnnested = <T extends PropertyKey>(
    record: Record<T, any>,
): readonly T[] => {
    let length = 0
    for (const [key] of pairs(record)) {
        ++length
        sortedKeysInternal[length - 1] = key
    }
    for (const i of $range(length + 1, lastSortedKeysLength)) {
        sortedKeysInternal[i - 1] = undefined!
    }
    lastSortedKeysLength = length
    tableSort(sortedKeysInternal)
    return sortedKeysInternal as T[]
}
