const marker = {} as const

export type Attribute<T> = {
    readonly __attribute: unique symbol
    readonly __type: T
    readonly __marker: typeof marker
} & symbol

export const attribute = <T>(): Attribute<T> => {
    return { __marker: marker } as Attribute<T>
}

export const isAttribute = (value: unknown): value is Attribute<unknown> => {
    return (
        type(value) == "table" && rawget(value as Record<keyof any, unknown>, "__marker") == marker
    )
}

export declare const getAttribute: (<T>(
    object: AttributesHolder,
    attribute: Attribute<T>,
) => T | undefined) &
    LuaExtension<"TableGet">

export declare const setAttribute: (<T>(
    object: AttributesHolder,
    attribute: Attribute<T>,
    value: T | undefined,
) => void) &
    LuaExtension<"TableSet">

export namespace Attribute {
    export const create = <T>(): Attribute<T> => {
        return { __marker: marker } as Attribute<T>
    }
}

export class AttributesHolder {
    declare readonly get: (<T>(attribute: Attribute<T>) => T | undefined) &
        LuaExtension<"TableGetMethod">
    declare readonly set: (<T>(attribute: Attribute<T>, value: T | undefined) => void) &
        LuaExtension<"TableSetMethod">
}
