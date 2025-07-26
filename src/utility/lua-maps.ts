import { Flatten, TupleOf } from "./types"

const select = _G.select
const setmetatable = _G.setmetatable

const weakKeysMetatable = {
    __mode: "k",
} as const

export const mutableLuaMap = <K extends AnyNotNil, V>(): LuaMap<K, V> => {
    return new LuaMap()
}

export const mutableWeakLuaMap = <K extends AnyNotNil, V>(): LuaMap<K, V> => {
    return setmetatable(new LuaMap(), weakKeysMetatable)
}

export const luaMapOf = <K extends AnyNotNil, V>(
    ...pairs: Flatten<
        TupleOf<
            [K, V],
            | 0
            | 1
            | 2
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
            | 9
            | 10
            | 11
            | 12
            | 13
            | 14
            | 15
            | 16
            | 17
            | 18
            | 19
            | 20
            | 21
            | 22
            | 23
            | 24
            | 25
            | 26
            | 27
            | 28
            | 29
            | 30
            | 31
            | 32
            | 33
            | 34
            | 35
            | 36
            | 37
            | 38
            | 39
            | 40
        >
    >
): LuaMap<K, V> => {
    const luaMap = new LuaMap<K, V>()
    for (const i of $range(1, select("#", ...pairs), 2)) {
        const [key, value] = select(i, ...pairs)
        luaMap.set(key as K, value as V)
    }
    return luaMap
}

export const luaMapInvert = <K extends AnyNotNil, V extends AnyNotNil>(
    luaMap: LuaMap<K, V>,
): LuaMap<V, K> => {
    const invertLuaMap = new LuaMap<V, K>()
    for (const [key, value] of luaMap) {
        invertLuaMap.set(value, key)
    }
    return invertLuaMap
}

export const mapValues = <K extends AnyNotNil, V1, V2>(
    luaMap: LuaMap<K, V1>,
    transform: (value: V1) => V2,
): LuaMap<K, V2> => {
    const result = new LuaMap<K, V2>()
    for (const [key, value] of luaMap) {
        result.set(key, transform(value))
    }
    return result
}

export const getOrPut = <K extends AnyNotNil, V>(
    luaMap: LuaMap<K, V>,
    key: K,
    defaultValue: () => V,
): V => {
    let value = luaMap.get(key)
    if (value == undefined) {
        value = defaultValue()
        luaMap.set(key, value)
    }
    return value
}
