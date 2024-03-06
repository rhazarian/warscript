import { Behavior } from "../behavior"
import { Ability } from "../internal/ability"
import { DamageEvent, DamagingEvent, Unit } from "../internal/unit"
import "../internal/unit-missile-launch"

export type UnitBehaviorConstructor<Args extends any[]> = new (
    unit: Unit,
    ...args: Args
) => UnitBehavior

export abstract class UnitBehavior<PeriodicActionParameters extends any[] = any[]> extends Behavior<
    Unit,
    PeriodicActionParameters
> {
    public constructor(unit: Unit) {
        super(unit)
    }

    public get unit(): Unit {
        return this.object
    }

    public onAutoAttackStart(target: Unit): void {
        // no-op
    }

    public onAutoAttackFinish(target: Unit): void {
        // no-op
    }

    public onDamageDealing(target: Unit, event: DamagingEvent): void {
        // no-op
    }

    public onDamageDealt(target: Unit, event: DamageEvent): void {
        // no-op
    }

    public onDamageReceiving(source: Unit | undefined, event: DamagingEvent): void {
        // no-op
    }

    public onDamageReceived(source: Unit | undefined, event: DamageEvent): void {
        // no-op
    }

    protected onAbilityGained(ability: Ability): void {
        // no-op
    }

    protected onAbilityLost(ability: Ability): void {
        // no-op
    }

    public onKill(target: Unit): void {
        // no-op
    }

    public onDeath(source: Unit | undefined): void {
        // no-op
    }

    static {
        Unit.autoAttackStartEvent.addListener((source, target) => {
            UnitBehavior.forAll(source, "onAutoAttackStart", target)
        })

        Unit.autoAttackFinishEvent.addListener((source, target) => {
            UnitBehavior.forAll(source, "onAutoAttackFinish", target)
        })

        Unit.onDamaging.addListener((source, target, event) => {
            if (source != undefined) {
                UnitBehavior.forAll(source, "onDamageDealing", target, event)
            }
            UnitBehavior.forAll(target, "onDamageReceiving", source, event)
        })

        Unit.onDamage.addListener((source, target, event) => {
            if (source != undefined) {
                UnitBehavior.forAll(source, "onDamageDealt", target, event)
            }
            UnitBehavior.forAll(target, "onDamageReceived", source, event)
        })

        Unit.deathEvent.addListener((target, source) => {
            if (source != undefined) {
                UnitBehavior.forAll(source, "onKill", target)
            }
            UnitBehavior.forAll(target, "onDeath", source)
        })
    }
}

Unit.destroyEvent.addListener((unit) => {
    UnitBehavior.forAll(unit, "destroy")
})
