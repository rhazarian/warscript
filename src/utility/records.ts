import { InvertRecordType } from "./types"

export const invertRecord = <T extends Record<PropertyKey, PropertyKey | null | undefined>>(
    record: T
): InvertRecordType<T> => {
    const invertRecord: Record<PropertyKey, PropertyKey> = {}
    for (const [key, value] of pairs(record)) {
        invertRecord[value] = key
    }
    return invertRecord as InvertRecordType<T>
}
