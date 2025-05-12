import { AbilityBehavior } from "../ability"
import { Unit } from "../../internal/unit"
import {
    COOLDOWN_ABILITY_FLOAT_LEVEL_FIELD,
    MANA_COST_ABILITY_INTEGER_LEVEL_FIELD,
} from "../../standard/fields/ability"

export abstract class EmulateImpactAbilityBehavior extends AbilityBehavior {
    protected emulateImpact(caster: Unit) {
        const abilityTypeId = this.ability.typeId
        const manaCost = this.resolveCurrentAbilityDependentValue(
            MANA_COST_ABILITY_INTEGER_LEVEL_FIELD,
        )
        const cooldown = this.resolveCurrentAbilityDependentValue(
            COOLDOWN_ABILITY_FLOAT_LEVEL_FIELD,
        )

        if (caster.getAbilityRemainingCooldown(abilityTypeId) != 0 || caster.mana < manaCost) {
            return
        }

        caster.mana -= manaCost
        if (cooldown == 0) {
            caster.interruptCast(this.ability.typeId)
        } else {
            caster.startAbilityCooldown(this.ability.typeId, cooldown)
        }

        AbilityBehavior.forAll(this.ability, "onImpact", caster)
    }
}
