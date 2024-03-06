import { Widget } from "../../../core/types/widget"
import { Ability } from "../../internal/ability"
import { Unit } from "../../internal/unit"
import { AbilityDependentValue } from "../../object-field/ability"
import { AbilityBehavior } from "../ability"

export class HealSelfAbilityBehavior extends AbilityBehavior {
    public constructor(ability: Ability, private readonly healing: AbilityDependentValue<number>) {
        super(ability)
    }

    public override onImpact(caster: Unit): void {
        caster.healTarget(caster, this.resolveCurrentAbilityDependentValue(this.healing))
    }
}

export class HealTargetAbilityBehavior extends AbilityBehavior {
    public constructor(ability: Ability, private readonly healing: AbilityDependentValue<number>) {
        super(ability)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        caster.healTarget(target, this.resolveCurrentAbilityDependentValue(this.healing))
    }
}
