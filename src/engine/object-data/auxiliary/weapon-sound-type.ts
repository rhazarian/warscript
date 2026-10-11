import { invertRecord } from "../../../utility/records"

/**
 * The weapon sound of an attack (`ucs1`/`ucs2` in object data, `jweapontype` at runtime): the
 * sound played on hit. The values are the native ones (`ConvertWeaponType`,
 * `UNIT_WEAPON_IF_ATTACK_WEAPON_SOUND`). Only the sounds the game offers are listed; the other
 * native weapon types (stabs, wood slices, claws) have no sound data.
 */
export const enum WeaponSoundType {
    NONE = 0,
    METAL_LIGHT_CHOP = 1,
    METAL_MEDIUM_CHOP = 2,
    METAL_HEAVY_CHOP = 3,
    METAL_LIGHT_SLICE = 4,
    METAL_MEDIUM_SLICE = 5,
    METAL_HEAVY_SLICE = 6,
    METAL_MEDIUM_BASH = 7,
    METAL_HEAVY_BASH = 8,
    WOOD_LIGHT_BASH = 14,
    WOOD_MEDIUM_BASH = 15,
    WOOD_HEAVY_BASH = 16,
    AXE_MEDIUM_CHOP = 22,
    ROCK_HEAVY_BASH = 23,
}

const stringByWeaponSoundType = {
    [WeaponSoundType.NONE]: "",
    [WeaponSoundType.METAL_LIGHT_CHOP]: "MetalLightChop",
    [WeaponSoundType.METAL_MEDIUM_CHOP]: "MetalMediumChop",
    [WeaponSoundType.METAL_HEAVY_CHOP]: "MetalHeavyChop",
    [WeaponSoundType.METAL_LIGHT_SLICE]: "MetalLightSlice",
    [WeaponSoundType.METAL_MEDIUM_SLICE]: "MetalMediumSlice",
    [WeaponSoundType.METAL_HEAVY_SLICE]: "MetalHeavySlice",
    [WeaponSoundType.METAL_MEDIUM_BASH]: "MetalMediumBash",
    [WeaponSoundType.METAL_HEAVY_BASH]: "MetalHeavyBash",
    [WeaponSoundType.WOOD_LIGHT_BASH]: "WoodLightBash",
    [WeaponSoundType.WOOD_MEDIUM_BASH]: "WoodMediumBash",
    [WeaponSoundType.WOOD_HEAVY_BASH]: "WoodHeavyBash",
    [WeaponSoundType.AXE_MEDIUM_CHOP]: "AxeMediumChop",
    [WeaponSoundType.ROCK_HEAVY_BASH]: "RockHeavyBash",
} as const

const weaponSoundTypeByString: Record<string, WeaponSoundType | undefined> =
    invertRecord(stringByWeaponSoundType)

const nativeByWeaponSoundType = {
    [WeaponSoundType.NONE]: WEAPON_TYPE_WHOKNOWS,
    [WeaponSoundType.METAL_LIGHT_CHOP]: WEAPON_TYPE_METAL_LIGHT_CHOP,
    [WeaponSoundType.METAL_MEDIUM_CHOP]: WEAPON_TYPE_METAL_MEDIUM_CHOP,
    [WeaponSoundType.METAL_HEAVY_CHOP]: WEAPON_TYPE_METAL_HEAVY_CHOP,
    [WeaponSoundType.METAL_LIGHT_SLICE]: WEAPON_TYPE_METAL_LIGHT_SLICE,
    [WeaponSoundType.METAL_MEDIUM_SLICE]: WEAPON_TYPE_METAL_MEDIUM_SLICE,
    [WeaponSoundType.METAL_HEAVY_SLICE]: WEAPON_TYPE_METAL_HEAVY_SLICE,
    [WeaponSoundType.METAL_MEDIUM_BASH]: WEAPON_TYPE_METAL_MEDIUM_BASH,
    [WeaponSoundType.METAL_HEAVY_BASH]: WEAPON_TYPE_METAL_HEAVY_BASH,
    [WeaponSoundType.WOOD_LIGHT_BASH]: WEAPON_TYPE_WOOD_LIGHT_BASH,
    [WeaponSoundType.WOOD_MEDIUM_BASH]: WEAPON_TYPE_WOOD_MEDIUM_BASH,
    [WeaponSoundType.WOOD_HEAVY_BASH]: WEAPON_TYPE_WOOD_HEAVY_BASH,
    [WeaponSoundType.AXE_MEDIUM_CHOP]: WEAPON_TYPE_AXE_MEDIUM_CHOP,
    [WeaponSoundType.ROCK_HEAVY_BASH]: WEAPON_TYPE_ROCK_HEAVY_BASH,
} as const

const weaponSoundTypeByNative: Record<jweapontype, WeaponSoundType | undefined> =
    invertRecord(nativeByWeaponSoundType)

/** @internal For use by internal systems only. */
export const weaponSoundTypeToString = (weaponSoundType: WeaponSoundType): string => {
    return stringByWeaponSoundType[weaponSoundType] ?? ""
}

/** @internal For use by internal systems only. */
export const stringToWeaponSoundType = (string: string): WeaponSoundType => {
    return weaponSoundTypeByString[string] ?? WeaponSoundType.NONE
}

/** @internal For use by internal systems only. */
export const weaponSoundTypeToNative = (weaponSoundType: WeaponSoundType): jweapontype => {
    return nativeByWeaponSoundType[weaponSoundType] ?? WEAPON_TYPE_WHOKNOWS
}

/**
 * @internal For use by internal systems only.
 *
 * The weapon types without sound data (stabs, wood slices, claws) come back as `NONE`.
 */
export const nativeToWeaponSoundType = (weaponType: jweapontype): WeaponSoundType => {
    return weaponSoundTypeByNative[weaponType] ?? WeaponSoundType.NONE
}
