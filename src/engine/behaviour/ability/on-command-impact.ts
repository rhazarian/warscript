import { Unit } from "../../internal/unit"
import { EmulateImpactAbilityBehavior } from "./emulate-impact"
import { Ability } from "../../internal/ability"

export class OnCommandImpactAbilityBehavior extends EmulateImpactAbilityBehavior {
    public constructor(ability: Ability) {
        super(ability)
        this.registerCommandEvent()
    }

    public override onCommand(caster: Unit): void {
        this.emulateImpact(caster)
    }
}

Unit.itemUseOrderEvent.addListener((unit, item) => {
    for (const ability of item.abilities) {
        OnCommandImpactAbilityBehavior.forAll(ability, "onCommand", unit)
    }
})
