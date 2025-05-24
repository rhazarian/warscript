import { AutoAttackSpeedIncreaseAbilityType } from "../../object-data/entry/ability-type/auto-attack-speed-increase"

/** @internal For use by internal systems. */
export const AUTO_ATTACK_SPEED_INCREASE_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = AutoAttackSpeedIncreaseAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.autoAttackSpeedIncreaseFactor = 0
    return abilityType.id
})

/** @internal For use by internal systems. */
export const AUTO_ATTACK_SPEED_INCREASE_FACTOR_ABILITY_FIELD =
    ABILITY_RLF_ATTACK_SPEED_INCREASE_ISX1
