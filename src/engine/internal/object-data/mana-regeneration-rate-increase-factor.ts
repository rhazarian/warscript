import { ManaRegenerationAbilityType } from "../../object-data/entry/ability-type/mana-regeneration"

/** @internal For use by internal systems. */
export const MANA_REGENERATION_RATE_INCREASE_FACTOR_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = ManaRegenerationAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.manaRegenerationRateIncreaseFactor = 0
    return abilityType.id
})

/** @internal For use by internal systems. */
export const MANA_REGENERATION_RATE_INCREASE_FACTOR_ABILITY_FIELD =
    ABILITY_RLF_MANA_REGENERATION_BONUS_AS_FRACTION_OF_NORMAL
