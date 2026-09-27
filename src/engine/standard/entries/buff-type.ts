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

/** `BHfs`: Flame Strike, on the units in the flames. */
export const FLAME_STRIKE_BUFF_TYPE_ID = fourCC("BHfs") as StandardBuffTypeId
/** `XHfs`: Flame Strike's area effect (the embers). */
export const FLAME_STRIKE_EFFECT_BUFF_TYPE_ID = fourCC("XHfs") as StandardBuffTypeId
/** `BNrd`: Rain of Fire's burning damage over time. */
export const RAIN_OF_FIRE_DAMAGE_BUFF_TYPE_ID = fourCC("BNrd") as StandardBuffTypeId
/** `BNrf`: Rain of Fire, on the units in the area. */
export const RAIN_OF_FIRE_BUFF_TYPE_ID = fourCC("BNrf") as StandardBuffTypeId
/** `XErf`: Rain of Fire's area effect (the falling fire). */
export const RAIN_OF_FIRE_EFFECT_BUFF_TYPE_ID = fourCC("XErf") as StandardBuffTypeId
/** `BNso`: Soul Burn. */
export const SOUL_BURN_BUFF_TYPE_ID = fourCC("BNso") as StandardBuffTypeId
/** `BNbf`: Breath of Fire's burning. */
export const BREATH_OF_FIRE_BUFF_TYPE_ID = fourCC("BNbf") as StandardBuffTypeId
/** `BNic`: Incinerate. */
export const INCINERATE_BUFF_TYPE_ID = fourCC("BNic") as StandardBuffTypeId
