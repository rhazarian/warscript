import { Unit } from "../../internal/unit"
import { Item } from "../../internal/item"
import { Destructable } from "../../../core/types/destructable"
import { EmulateImpactAbilityBehavior } from "./emulate-impact"

/**
 * Makes the ability take effect as soon as its cast starts, skipping the cast animation:
 * the impact events fire with the cast's target, so target-specific impact handlers
 * (`onPointTargetImpact`, `onUnitTargetImpact`, ...) work as with a native impact.
 */
export class InstantImpactAbilityBehavior extends EmulateImpactAbilityBehavior {
    public override onUnitTargetCastingStart(caster: Unit, target: Unit): void {
        this.emulateUnitTargetImpact(caster, target)
    }

    public override onItemTargetCastingStart(caster: Unit, target: Item): void {
        this.emulateItemTargetImpact(caster, target)
    }

    public override onDestructibleTargetCastingStart(caster: Unit, target: Destructable): void {
        this.emulateDestructibleTargetImpact(caster, target)
    }

    public override onPointTargetCastingStart(caster: Unit, x: number, y: number): void {
        this.emulatePointTargetImpact(caster, x, y)
    }

    public override onNoTargetCastingStart(caster: Unit): void {
        this.emulateNoTargetImpact(caster)
    }
}
