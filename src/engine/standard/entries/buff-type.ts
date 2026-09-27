import { StandardBuffTypeId } from "../../object-data/entry/buff-type"

export const CHEMICAL_RAGE_BUFF_TYPE_ID = fourCC("BNcr") as StandardBuffTypeId

/** `Bdcb`: Drain Life & Mana, on the caster (art only, never shown on the info card). */
export const DRAIN_LIFE_AND_MANA_CASTER_BUFF_TYPE_ID = fourCC("Bdcb") as StandardBuffTypeId
/** `Bdcl`: Drain Life, on the caster (art only). */
export const DRAIN_LIFE_CASTER_BUFF_TYPE_ID = fourCC("Bdcl") as StandardBuffTypeId
/** `Bdcm`: Drain Mana, on the caster (art only). */
export const DRAIN_MANA_CASTER_BUFF_TYPE_ID = fourCC("Bdcm") as StandardBuffTypeId
/** `Bdtb`: Drain Life & Mana, on the target (art only). */
export const DRAIN_LIFE_AND_MANA_TARGET_BUFF_TYPE_ID = fourCC("Bdtb") as StandardBuffTypeId
/** `Bdtl`: Drain Life, on the target (art only). */
export const DRAIN_LIFE_TARGET_BUFF_TYPE_ID = fourCC("Bdtl") as StandardBuffTypeId
/** `Bdtm`: Drain Mana, on the target (art only). */
export const DRAIN_MANA_TARGET_BUFF_TYPE_ID = fourCC("Bdtm") as StandardBuffTypeId
/**
 * `Bdbb`: Drain Life & Mana bonus, on the caster. The three bonus buffs are missing from
 * Warpack's stock data: usable as ids, not as a base to copy (`BuffType[id]`).
 */
export const DRAIN_LIFE_AND_MANA_BONUS_BUFF_TYPE_ID = fourCC("Bdbb") as StandardBuffTypeId
/** `Bdbl`: Drain Life bonus, on the caster. */
export const DRAIN_LIFE_BONUS_BUFF_TYPE_ID = fourCC("Bdbl") as StandardBuffTypeId
/** `Bdbm`: Drain Mana bonus, on the caster. */
export const DRAIN_MANA_BONUS_BUFF_TYPE_ID = fourCC("Bdbm") as StandardBuffTypeId
