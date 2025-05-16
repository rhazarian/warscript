import { AbilityBehavior } from "../ability"
import { Unit } from "../../internal/unit"
import {
    COOLDOWN_ABILITY_FLOAT_LEVEL_FIELD,
    MANA_COST_ABILITY_INTEGER_LEVEL_FIELD,
} from "../../standard/fields/ability"
import { max, MINIMUM_POSITIVE_NORMALIZED_FLOAT } from "../../../math"

export abstract class EmulateImpactAbilityBehavior extends AbilityBehavior {
    protected emulateImpact(caster: Unit) {
        const manaCost = this.resolveCurrentAbilityDependentValue(
            MANA_COST_ABILITY_INTEGER_LEVEL_FIELD,
        )
        const cooldown = this.resolveCurrentAbilityDependentValue(
            COOLDOWN_ABILITY_FLOAT_LEVEL_FIELD,
        )

        if (this.ability.cooldownRemaining != 0 || caster.mana < manaCost) {
            return
        }

        caster.mana -= manaCost
        this.ability.cooldownRemaining = max(cooldown, MINIMUM_POSITIVE_NORMALIZED_FLOAT)

        this.flashCasterEffect(caster)

        AbilityBehavior.forAll(this.ability, "onImpact", caster)
    }
}
