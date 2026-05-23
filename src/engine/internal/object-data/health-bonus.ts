import { HealthBonusAbilityType } from "../../object-data/entry/ability-type/health-bonus"

/** @internal For use by internal systems only. */
export const HEALTH_BONUS_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = HealthBonusAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.healthBonus = 0
    return abilityType.id
})

/** @internal For use by internal systems only. */
export const HEALTH_BONUS_DUMMY_ABILITY_FIELD = ABILITY_ILF_MAX_LIFE_GAINED
