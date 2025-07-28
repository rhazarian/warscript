import { invertRecord } from "../../../utility/records"

export const enum AttackType {
    SPELL = 0,
    NORMAL = 1,
    PIERCE = 2,
    SIEGE = 3,
    MAGIC = 4,
    CHAOS = 5,
    HERO = 6,
}

const stringByAttackType = {
    [AttackType.NORMAL]: "normal",
    [AttackType.PIERCE]: "pierce",
    [AttackType.SIEGE]: "siege",
    [AttackType.SPELL]: "spells",
    [AttackType.CHAOS]: "chaos",
    [AttackType.MAGIC]: "magic",
    [AttackType.HERO]: "hero",
} as const

const attackTypeByString: Record<string, AttackType | undefined> =
    invertRecord(stringByAttackType)

const nativeByAttackType = {
    [AttackType.NORMAL]: ATTACK_TYPE_MELEE,
    [AttackType.PIERCE]: ATTACK_TYPE_PIERCE,
    [AttackType.SIEGE]: ATTACK_TYPE_SIEGE,
    [AttackType.SPELL]: ATTACK_TYPE_NORMAL,
    [AttackType.CHAOS]: ATTACK_TYPE_CHAOS,
    [AttackType.MAGIC]: ATTACK_TYPE_MAGIC,
    [AttackType.HERO]: ATTACK_TYPE_HERO,
} as const

const attackTypeByNative: Record<jattacktype, AttackType> = invertRecord(nativeByAttackType)

/** @internal For use by internal systems only. */
export const attackTypeToString = (attackType: AttackType | undefined): string => {
    return attackType != undefined ? stringByAttackType[attackType] : "unknown"
}

/** @internal For use by internal systems only. */
export const stringToAttackType = (string: string): AttackType | undefined => {
    return attackTypeByString[string]
}

/** @internal For use by internal systems only. */
export const attackTypeToNative = (attackType: AttackType): jattacktype => {
    return nativeByAttackType[attackType]
}

/** @internal For use by internal systems only. */
export const nativeToAttackType = (attackType: jattacktype): AttackType => {
    return attackTypeByNative[attackType]
}
