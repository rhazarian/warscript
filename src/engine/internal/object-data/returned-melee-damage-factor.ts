import { SpikedCarapaceAbilityType } from "../../object-data/entry/ability-type/spiked-carapace"

/**
 * @internal For use by internal systems.
 *
 * Spiked Carapace returns the given factor of melee attack damage to the attacker; the engine
 * decides what counts as a melee attack.
 */
export const RETURNED_MELEE_DAMAGE_FACTOR_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = SpikedCarapaceAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.returnedDamageFactor = 0
    abilityType.receivedDamageFactor = 1
    abilityType.armorIncrease = 0
    return abilityType.id
})

/** @internal For use by internal systems. */
export const RETURNED_MELEE_DAMAGE_FACTOR_ABILITY_FIELD = ABILITY_RLF_RETURNED_DAMAGE_FACTOR
