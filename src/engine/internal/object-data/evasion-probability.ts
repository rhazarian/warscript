import { EvasionAbilityType } from "../../object-data/entry/ability-type/evasion"

/** @internal For use by internal systems. */
export const EVASION_PROBABILITY_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = EvasionAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.evasionProbability = 0
    return abilityType.id
})

/** @internal For use by internal systems. */
export const EVASION_PROBABILITY_ABILITY_FIELD = ABILITY_RLF_CHANCE_TO_EVADE_EEV1
