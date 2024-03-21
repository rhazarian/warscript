export type Attribute<T> = {
    readonly __attribute: unique symbol
    readonly __type: T
} & symbol

export namespace Attribute {
    export const create = <T>(): Attribute<T> => {
        return {} as Attribute<T>
    }
}

export class AttributesHolder {
    declare readonly get: (<T>(attribute: Attribute<T>) => T | undefined) &
        LuaExtension<"TableGetMethod">
    declare readonly set: (<T>(attribute: Attribute<T>, value: T | undefined) => void) &
        LuaExtension<"TableSetMethod">
}
