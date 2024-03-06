import { SpellDamageReductionAbilityType } from "../../object-data/entry/ability-type/spell-damage-reduction"

/** @internal For use by internal systems only. */
export const AUTO_ATTACK_DAMAGE_INCREASE_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = SpellDamageReductionAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.autoAttackDamageIncrease = 0
    abilityType.receivedSpellDamageDecreaseFactor = 0
    return abilityType.id
})

/** @internal For use by internal systems. */
export const AUTO_ATTACK_DAMAGE_INCREASE_ABILITY_FIELD = ABILITY_RLF_DAMAGE_BONUS_ISR1
