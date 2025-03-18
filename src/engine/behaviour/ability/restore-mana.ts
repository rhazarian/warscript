import { Ability } from "../../internal/ability"
import { Unit } from "../../internal/unit"
import { AbilityDependentValue } from "../../object-field/ability"
import { AbilityBehavior } from "../ability"

export class RestoreManaSelfAbilityBehavior extends AbilityBehavior {
    public constructor(
        ability: Ability,
        private readonly mana: AbilityDependentValue<number>,
    ) {
        super(ability)
    }

    public override onImpact(caster: Unit): void {
        caster.mana += this.resolveCurrentAbilityDependentValue(this.mana)
    }
}

export class RestoreManaAbilityBehavior extends AbilityBehavior {
    public constructor(
        ability: Ability,
        private readonly mana: AbilityDependentValue<number>,
    ) {
        super(ability)
    }

    public override onUnitTargetImpact(caster: Unit, target: Unit): void {
        target.mana += this.resolveCurrentAbilityDependentValue(this.mana)
    }
}
