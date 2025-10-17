const select = _G.select

const EMPTY_LUA_SET: ReadonlyLuaSet<any> = new LuaSet()

export const emptyLuaSet = <T extends AnyNotNil>(): ReadonlyLuaSet<T> => {
    return EMPTY_LUA_SET
}

export const mutableLuaSet = <T extends AnyNotNil>(): LuaSet<T> => {
    return new LuaSet()
}

export const luaSetOf = <T extends AnyNotNil>(...elements: readonly T[]): LuaSet<T> => {
    const luaSet = new LuaSet<T>()
    for (const i of $range(1, select("#", ...elements))) {
        luaSet.add(select(i, ...elements)[0])
    }
    return luaSet
}

export const luaSetOfNotNull = <T extends AnyNotNil>(
    ...elements: readonly (T | undefined | null)[]
): LuaSet<T> => {
    const luaSet = new LuaSet<T>()
    for (const i of $range(1, select("#", ...elements))) {
        const [value] = select(i, ...elements)
        if (value != undefined) {
            luaSet.add(value)
        }
    }
    return luaSet
}

export const luaSetIntersection = <T extends AnyNotNil>(
    firstLuaSet: ReadonlyLuaSet<T>,
    secondLuaSet: ReadonlyLuaSet<T>
): LuaSet<T> => {
    const luaSet = new LuaSet<T>()
    for (const element of firstLuaSet) {
        if (secondLuaSet.has(element)) {
            luaSet.add(element)
        }
    }
    return luaSet
}

export const luaSetContainsAnyOf = <T extends AnyNotNil>(
    luaSet: ReadonlyLuaSet<T>,
    ...elements: readonly T[]
): boolean => {
    for (const i of $range(1, select("#", ...elements))) {
        if (luaSet.has(select(i, ...elements)[0])) {
            return true
        }
    }
    return false
}
