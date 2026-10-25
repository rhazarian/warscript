import { MovementSpeedIncreaseAbilityType } from "../../object-data/entry/ability-type/movement-speed-increase"

/** @internal For use by internal systems only. */
export const MOVEMENT_SPEED_INCREASE_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = MovementSpeedIncreaseAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.movementSpeedIncrease = 0
    return abilityType.id
})

/** @internal For use by internal systems only. */
export const MOVEMENT_SPEED_INCREASE_ABILITY_FIELD = ABILITY_ILF_MOVEMENT_SPEED_BONUS
