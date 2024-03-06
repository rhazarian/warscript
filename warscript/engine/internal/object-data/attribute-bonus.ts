import { AttributeBonusAbilityType } from "../../object-data/entry/ability-type/attribute-increase"

/** @internal For use by internal systems. */
export const ATTRIBUTE_BONUS_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = AttributeBonusAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.strengthBonus = 0
    abilityType.agilityBonus = 0
    abilityType.intelligenceBonus = 0
    return abilityType.id
})
