import { AbilityBehavior } from "../ability"
import { Unit } from "../../internal/unit"
import { Ability } from "../../internal/ability"
import { AbilityDependentValue } from "../../object-field/ability"
import { BuffPolarity } from "../../object-data/auxiliary/buff-polarity"
import { BuffResistanceType } from "../../object-data/auxiliary/buff-resistance-type"

export class RemoveBuffsSelfAbilityBehavior extends AbilityBehavior {
    public constructor(
        ability: Ability,
        private readonly polarity?: AbilityDependentValue<BuffPolarity>,
        private readonly resistanceType?: AbilityDependentValue<BuffResistanceType>,
    ) {
        super(ability)
    }

    public onImpact(caster: Unit) {
        caster.removeBuffs(
            this.resolveCurrentAbilityDependentValue(this.polarity),
            this.resolveCurrentAbilityDependentValue(this.resistanceType),
        )
    }
}
