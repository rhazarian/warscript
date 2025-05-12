const rawset = _G.rawset
const setmetatable = _G.setmetatable

export const lazyRecord = <K extends keyof any, V>(
    initializer: (key: K) => V,
): Readonly<Record<K, V>> => {
    return setmetatable({} as Record<K, V>, {
        __index(key: K): V {
            const value = initializer(key)
            rawset(this, key, value)
            return value
        },
    })
}
