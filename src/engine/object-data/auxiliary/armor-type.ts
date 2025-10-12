import { invertRecord } from "../../../utility/records"

export const enum ArmorType {
    LIGHT = 0,
    MEDIUM = 1,
    HEAVY = 2,
    FORTIFIED = 3,
    NORMAL = 4,
    HERO = 5,
    DIVINE = 6,
    UNARMORED = 7,
}

const stringByArmorType = {
    [ArmorType.LIGHT]: "small",
    [ArmorType.MEDIUM]: "medium",
    [ArmorType.HEAVY]: "large",
    [ArmorType.FORTIFIED]: "fort",
    [ArmorType.NORMAL]: "normal",
    [ArmorType.HERO]: "hero",
    [ArmorType.DIVINE]: "divine",
    [ArmorType.UNARMORED]: "none",
} as const

const armorTypeByString: Record<string, ArmorType | undefined> = invertRecord(stringByArmorType)

const nativeByArmorType = {
    [ArmorType.LIGHT]: DEFENSE_TYPE_LIGHT,
    [ArmorType.MEDIUM]: DEFENSE_TYPE_MEDIUM,
    [ArmorType.HEAVY]: DEFENSE_TYPE_LARGE,
    [ArmorType.FORTIFIED]: DEFENSE_TYPE_FORT,
    [ArmorType.NORMAL]: DEFENSE_TYPE_NORMAL,
    [ArmorType.HERO]: DEFENSE_TYPE_HERO,
    [ArmorType.DIVINE]: DEFENSE_TYPE_DIVINE,
    [ArmorType.UNARMORED]: DEFENSE_TYPE_NONE,
} as const

const armorTypeByNative: Record<jdefensetype, ArmorType> = invertRecord(nativeByArmorType)

/** @internal For use by internal systems only. */
export const armorTypeToString = (armorType: ArmorType): string => {
    return stringByArmorType[armorType]
}

/** @internal For use by internal systems only. */
export const stringToArmorType = (string: string): ArmorType => {
    return armorTypeByString[string] ?? ArmorType.UNARMORED
}

/** @internal For use by internal systems only. */
export const armorTypeToNative = (armorType: ArmorType): jdefensetype => {
    return nativeByArmorType[armorType]
}

/** @internal For use by internal systems only. */
export const nativeToArmorType = (armorType: jdefensetype): ArmorType => {
    return armorTypeByNative[armorType]
}
