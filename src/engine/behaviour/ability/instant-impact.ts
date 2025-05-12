import { Unit } from "../../internal/unit"
import { EmulateImpactAbilityBehavior } from "./emulate-impact"

export class InstantImpactAbilityBehavior extends EmulateImpactAbilityBehavior {
    public override onCastingStart(caster: Unit): void {
        this.emulateImpact(caster)
    }
}
