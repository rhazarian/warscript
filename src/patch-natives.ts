declare global {
    type oskeymeta = {
        readonly __oskeymeta: unique symbol
    } & number

    const OSKEY_META_NONE: oskeymeta
    const OSKEY_META_SHIFT: oskeymeta
    const OSKEY_META_CTRL: oskeymeta
    const OSKEY_META_ALT: oskeymeta
}

{
    const g = _G as any
    g.OSKEY_META_NONE = 0
    g.OSKEY_META_SHIFT = 1
    g.OSKEY_META_CTRL = 2
    g.OSKEY_META_ALT = 4
}

compiletime(() => {
    _G.GetLocalizedString = function (this: void, source: string): string {
        return (currentMap && currentMap.strings.localized(source)) || source
    }
})

export {}
