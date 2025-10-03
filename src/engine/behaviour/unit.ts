import { Behavior } from "../behavior"
import { Ability } from "../internal/ability"
import { DamageEvent, DamagingEvent, Unit } from "../internal/unit"
import "../internal/unit+ability"
import "../internal/unit-missile-launch"
import { Item } from "../internal/item"
import type { AbilityBehavior } from "./ability"
import { Event } from "../../event"
import { LinkedSet } from "../../utility/linked-set"
import { Destructor } from "../../destroyable"
import { getOrPut, mutableLuaMap } from "../../utility/lua-maps"
import { mutableLuaSet } from "../../utility/lua-sets"
import type { Widget } from "../../core/types/widget"

export type UnitBehaviorConstructor<Args extends any[]> = new (
    unit: Unit,
    ...args: Args
) => UnitBehavior

const behaviorsByEvent = new LuaMap<Event, LinkedSet<UnitBehavior>>()
const rangeByBehaviorByEvent = new LuaMap<Event, LuaMap<UnitBehavior, number>>()
const listenerByBehaviorByEvent = new LuaMap<Event, LuaMap<UnitBehavior, string>>()

const eventsByBehavior = new LuaMap<UnitBehavior, LuaSet<Event>>()

export abstract class UnitBehavior<PeriodicActionParameters extends any[] = any[]> extends Behavior<
    Unit,
    PeriodicActionParameters
> {
    public constructor(unit: Unit) {
        super(unit)
    }

    protected override onDestroy(): Destructor {
        const events = eventsByBehavior.get(this)
        if (events !== undefined) {
            for (const event of events) {
                behaviorsByEvent.get(event)?.remove(this)
                rangeByBehaviorByEvent.get(event)?.delete(this)
                listenerByBehaviorByEvent.get(event)?.delete(this)
            }
            eventsByBehavior.delete(this)
        }
        return super.onDestroy()
    }

    public readonly sourceAbilityBehavior?: AbilityBehavior

    public get unit(): Unit {
        return this.object
    }

    public registerInRangeUnitEvent<T extends string, Args extends any[]>(
        this: UnitBehavior<PeriodicActionParameters> &
            Record<T, (this: this, unit: Unit, ...args: Args) => unknown>,
        event: Event<[Unit, ...Args]>,
        range: number,
        listener: T,
    ): void {
        const rangeByBehavior = getOrPut(rangeByBehaviorByEvent, event, mutableLuaMap)
        rangeByBehavior.set(this, range)
        const listenerByBehavior = getOrPut(listenerByBehaviorByEvent, event, mutableLuaMap)
        listenerByBehavior.set(this, listener)
        getOrPut(eventsByBehavior, this, mutableLuaSet).add(event)
        let behaviors = behaviorsByEvent.get(event)
        if (behaviors == undefined) {
            event.addListener((unit, ...args) => {
                const behaviors = behaviorsByEvent.get(event)
                if (behaviors !== undefined) {
                    for (const behavior of behaviors) {
                        const range = rangeByBehavior.get(behavior)
                        if (
                            range !== undefined &&
                            unit.getCollisionDistanceTo(behavior.unit) <= range
                        ) {
                            ;(
                                behavior as Record<
                                    T,
                                    (this: unknown, unit: Unit, ...args: Args) => unknown
                                >
                            )[listenerByBehavior.get(behavior)! as T](unit, ...args)
                        }
                    }
                }
            })
            behaviors = new LinkedSet()
            behaviorsByEvent.set(event, behaviors)
        }
        behaviors.add(this)
    }

    public onImmediateOrder(orderId: number): void {
        // no-op
    }

    public onTargetOrder(orderId: number, target: Widget): void {
        // no-op
    }

    public onPointOrder(orderId: number, x: number, y: number): void {
        // no-op
    }

    public onAutoAttackStart(target: Unit): void {
        // no-op
    }

    public onAutoAttackFinish(target: Unit): void {
        // no-op
    }

    public onTargetingAutoAttackStart(source: Unit): void {
        // no-op
    }

    public onTargetingAutoAttackFinish(source: Unit): void {
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

    public onAbilityGained(ability: Ability): void {
        // no-op
    }

    public onAbilityLost(ability: Ability): void {
        // no-op
    }

    public onAbilityChannelingStart(ability: Ability): void {
        // no-op
    }

    public onAbilityImpact(ability: Ability): void {
        // no-op
    }

    public onAbilityChannelingFinish(ability: Ability): void {
        // no-op
    }

    public onAbilityStop(ability: Ability): void {
        // no-op
    }

    public onItemDropped(item: Item): void {
        // no-op
    }

    public onItemPickedUp(item: Item): void {
        // no-op
    }

    public onItemUsed(item: Item): void {
        // no-op
    }

    public onItemStacked(item: Item): void {
        // no-op
    }

    public onItemChargesChanged(item: Item): void {
        // no-op
    }

    public onKill(target: Unit): void {
        // no-op
    }

    public onDeath(source: Unit | undefined): void {
        // no-op
    }

    static {
        Unit.onImmediateOrder.addListener((source, orderId) => {
            UnitBehavior.forAll(source, "onImmediateOrder", orderId)
        })
        Unit.onTargetOrder.addListener((source, orderId, target) => {
            UnitBehavior.forAll(source, "onTargetOrder", orderId, target)
        })
        Unit.onPointOrder.addListener((source, orderId, x, y) => {
            UnitBehavior.forAll(source, "onPointOrder", orderId, x, y)
        })

        Unit.autoAttackStartEvent.addListener((source, target) => {
            UnitBehavior.forAll(source, "onAutoAttackStart", target)
            UnitBehavior.forAll(target, "onTargetingAutoAttackStart", source)
        })

        Unit.autoAttackFinishEvent.addListener((source, target) => {
            UnitBehavior.forAll(source, "onAutoAttackFinish", target)
            UnitBehavior.forAll(target, "onTargetingAutoAttackFinish", source)
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

        Unit.abilityGainedEvent.addListener((source, ability) => {
            UnitBehavior.forAll(source, "onAbilityGained", ability)
        })

        Unit.abilityLostEvent.addListener((source, ability) => {
            UnitBehavior.forAll(source, "onAbilityLost", ability)
        })

        Unit.abilityChannelingStartEvent.addListener((source, ability) => {
            UnitBehavior.forAll(source, "onAbilityChannelingStart", ability)
        })
        Unit.abilityImpactEvent.addListener((source, ability) => {
            UnitBehavior.forAll(source, "onAbilityImpact", ability)
        })
        Unit.abilityChannelingFinishEvent.addListener((source, ability) => {
            UnitBehavior.forAll(source, "onAbilityChannelingFinish", ability)
        })
        Unit.abilityStopEvent.addListener((source, ability) => {
            UnitBehavior.forAll(source, "onAbilityStop", ability)
        })

        Unit.deathEvent.addListener((target, source) => {
            if (source != undefined) {
                UnitBehavior.forAll(source, "onKill", target)
            }
            UnitBehavior.forAll(target, "onDeath", source)
        })

        Unit.itemDroppedEvent.addListener((unit, item) => {
            UnitBehavior.forAll(unit, "onItemDropped", item)
        })
        Unit.itemPickedUpEvent.addListener((unit, item) => {
            UnitBehavior.forAll(unit, "onItemPickedUp", item)
        })
        Unit.itemUsedEvent.addListener((unit, item) => {
            UnitBehavior.forAll(unit, "onItemUsed", item)
        })
        Unit.itemStackedEvent.addListener((unit, item) => {
            UnitBehavior.forAll(unit, "onItemStacked", item)
        })
        Unit.itemChargesChangedEvent.addListener((unit, item) => {
            UnitBehavior.forAll(unit, "onItemChargesChanged", item)
        })
    }
}

Unit.destroyEvent.addListener((unit) => {
    UnitBehavior.forAll(unit, "destroy")
})
