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

    // Patch 2.0.3 made the weapon field natives support the attack's weapon type ('ua1w'), but
    // common.j does not declare the constant: without this the global is nil, and the natives
    // read 0 and write nothing.
    if (g.UNIT_WEAPON_IF_ATTACK_WEAPON_TYPE == undefined) {
        g.UNIT_WEAPON_IF_ATTACK_WEAPON_TYPE = ConvertUnitWeaponIntegerField(fourCC("ua1w"))
    }
}

compiletime(() => {
    _G.GetLocalizedString = function (this: void, source: string): string {
        return (currentMap && currentMap.strings.localized(source)) || source
    }
})

export {}
