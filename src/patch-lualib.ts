const lualib = _G.require("lualib_bundle")

const next = _G.next
const type = _G.type

lualib.__TS__ArrayIsArray = function (this: void, value: any): boolean {
    return (
        type(value) == "table" &&
        (value[1] != undefined || next(value)[0] == undefined) &&
        value.constructor == undefined
    )
}

const __TS__SetDescriptor = lualib["__TS__SetDescriptor"]

lualib.__TS__ObjectDefineProperty = function <T extends object>(
    this: void,
    target: T,
    key: any,
    desc: PropertyDescriptor
): T {
    const luaKey = typeof key === "number" ? key + 1 : key
    const value = rawget(target, luaKey)

    const hasGetterOrSetter = desc.get !== undefined || desc.set !== undefined

    let descriptor: PropertyDescriptor
    if (hasGetterOrSetter) {
        if (value !== undefined) {
            throw `Cannot redefine property: ${key}`
        }

        descriptor = desc
    } else {
        const valueExists = value !== undefined
        descriptor = {
            set: desc.set,
            get: desc.get,
            configurable: desc.configurable !== undefined ? desc.configurable : valueExists,
            enumerable: desc.enumerable !== undefined ? desc.enumerable : valueExists,
            writable: desc.writable !== undefined ? desc.writable : valueExists,
            value: desc.value !== undefined ? desc.value : value,
        }
    }

    __TS__SetDescriptor(
        target,
        luaKey,
        descriptor,
        type(target.constructor) == "table" && target.constructor.prototype == target
    )
    return target
}

export {}
