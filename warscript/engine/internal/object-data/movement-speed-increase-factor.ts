import { EngineeringUpgradeAbilityType } from "../../object-data/entry/ability-type/engineering-upgrade"

/** @internal For use by internal systems. */
export const MOVEMENT_SPEED_INCREASE_FACTOR_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = EngineeringUpgradeAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.movementSpeedIncreaseFactor = 0
    abilityType.autoAttackDamageIncrease = 0
    abilityType.abilityUpgrades = []
    return abilityType.id
})

/** @internal For use by internal systems. */
export const MOVEMENT_SPEED_INCREASE_FACTOR_ABILITY_FIELD = ABILITY_RLF_MOVE_SPEED_BONUS_NEG1
