import { HealingWardAuraAbilityType } from "../../object-data/entry/ability-type/healing-ward-aura"
import { ItemLifeRegenerationAbilityType } from "../../object-data/entry/ability-type/item-life-regeneration"
import { AbilityTypeId } from "../../object-data/entry/ability-type"
import {
    CombatClassification,
    combatClassificationsOf,
} from "../../object-data/auxiliary/combat-classification"

// The item regeneration ability applies its object data value and ignores runtime
// field writes, so every value it contributes needs its own preset ability.

const createHealthRegenerationDummyAbilityType = (healthRegeneration: number): AbilityTypeId => {
    const abilityType = ItemLifeRegenerationAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.healthRegeneration = healthRegeneration
    return abilityType.id
}

/**
 * @internal For use by internal systems. The ability at index `i` regenerates `2^i` hit
 * points per second; together they compose any value from 0 to 1023.
 */
export const HEALTH_REGENERATION_RATE_INCREASE_DUMMY_ABILITY_TYPE_IDS: readonly AbilityTypeId[] =
    compiletime(() => {
        const abilityTypeIds: AbilityTypeId[] = []
        for (const i of $range(0, 9)) {
            abilityTypeIds[i] = createHealthRegenerationDummyAbilityType(1 << i)
        }
        return abilityTypeIds
    })

/** @internal For use by internal systems. */
export const HEALTH_REGENERATION_RATE_DECREASE_DUMMY_VALUE = -1024

/** @internal For use by internal systems. Shifts negative values into the positive range. */
export const HEALTH_REGENERATION_RATE_DECREASE_DUMMY_ABILITY_TYPE_ID = compiletime(() =>
    createHealthRegenerationDummyAbilityType(HEALTH_REGENERATION_RATE_DECREASE_DUMMY_VALUE),
)

/**
 * @internal For use by internal systems. Holds the fractional remainder; being an aura,
 * it accepts field writes but applies with the usual aura delay.
 */
export const FRACTIONAL_HEALTH_REGENERATION_RATE_INCREASE_DUMMY_ABILITY_TYPE_ID = compiletime(
    () => {
        const abilityType = HealingWardAuraAbilityType.create()
        abilityType.isInternal = true
        abilityType.isButtonVisible = false
        abilityType.healthRegeneration = 0
        abilityType.isHealthRegenerationPercentage = false
        abilityType.allowedTargetCombatClassifications = combatClassificationsOf(
            CombatClassification.SELF,
        )
        abilityType.buffTypeIds = []
        abilityType.targetEffectPresets = []
        return abilityType.id
    },
)

/** @internal For use by internal systems. */
export const FRACTIONAL_HEALTH_REGENERATION_RATE_INCREASE_ABILITY_FIELD =
    ABILITY_RLF_AMOUNT_OF_HIT_POINTS_REGENERATED
