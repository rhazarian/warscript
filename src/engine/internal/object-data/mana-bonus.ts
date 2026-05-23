import { ManaBonusAbilityType } from "../../object-data/entry/ability-type/mana-bonus"

/** @internal For use by internal systems only. */
export const MANA_BONUS_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = ManaBonusAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.manaBonus = 0
    return abilityType.id
})

/** @internal For use by internal systems only. */
export const MANA_BONUS_DUMMY_ABILITY_FIELD = ABILITY_ILF_MAX_MANA_GAINED
