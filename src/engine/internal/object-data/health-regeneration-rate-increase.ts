import { AuraOfBlightAbilityType } from "../../object-data/entry/ability-type/aura-of-blight"
import {
    CombatClassification,
    combatClassificationsOf,
} from "../../object-data/auxiliary/combat-classification"

/** @internal For use by internal systems. */
export const HEALTH_REGENERATION_RATE_INCREASE_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = AuraOfBlightAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.healthRegeneration = 0
    abilityType.isHealthRegenerationPercentage = false
    abilityType.allowedTargetCombatClassifications = combatClassificationsOf(
        CombatClassification.SELF,
        CombatClassification.VULNERABLE,
        CombatClassification.INVULNERABLE,
    )
    abilityType.buffTypeIds = []
    return abilityType.id
})

/** @internal For use by internal systems. */
export const HEALTH_REGENERATION_RATE_INCREASE_ABILITY_FIELD =
    ABILITY_RLF_AMOUNT_OF_HIT_POINTS_REGENERATED
