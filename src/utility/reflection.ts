import { AbstractConstructor, Constructor } from "./types"
import { checkNotNull } from "./preconditions"

interface AbstractConstructorTSTLInternals extends AbstractConstructor {
    ____super?: AbstractConstructor
}

/** @internal For use by internal systems only. */
export const implementReadonlyNumberIndexSupplier = <
    T extends AbstractConstructor & Record<PropertyKey, any>,
>(
    clazz: T,
    supplier: (
        key: T extends Record<infer K, any> ? Exclude<K, string> : never,
    ) => T extends Record<infer K, any> ? T[Exclude<K, string>] : never,
): void => {
    const metatable = checkNotNull(getmetatable(clazz))
    const originalIndex = checkNotNull(rawget(metatable, "__index"))
    const memoizedValueByKey = new LuaMap<number, any>()
    rawset(
        metatable,
        "__index",
        function (this: any, key: any): any {
            if (typeof key == "number") {
                const value = supplier(key as any)
                memoizedValueByKey.set(key, value)
                return value
            }
            if (typeof originalIndex == "function") {
                return (originalIndex as any)(this, key)
            }
            return (originalIndex as any)[key]
        },
    )
}

export const getClass = <T extends object>(object: T): Constructor<T> | undefined => {
    return object.constructor as Constructor
}

export const getSuperclass = <T extends object>(
    clazz: AbstractConstructor<T>,
): AbstractConstructor<T> | undefined => {
    return (clazz as AbstractConstructorTSTLInternals).____super
}
