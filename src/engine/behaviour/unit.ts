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
import { Destructable } from "../../core/types/destructable"
import type { Buff } from "../buff"
import {
    addOrUpdateOrRemoveUnitBonus,
    getUnitBonus,
    removeUnitBonus,
    UnitBonusId,
    UnitBonusType,
} from "../internal/unit/bonus"
import { Player } from "../../core/types/player"

const safeCall = warpack.safeCall

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
    public readonly sourceAbilityBehavior?: AbilityBehavior

    private _bonusIdByBonusType?: LuaMap<UnitBonusType, UnitBonusId | undefined>

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
        if (this._bonusIdByBonusType != undefined) {
            for (const [bonusType, bonusId] of this._bonusIdByBonusType) {
                removeUnitBonus(this.object, bonusType, bonusId!)
            }
        }
        return super.onDestroy()
    }

    public get unit(): Unit {
        return this.object
    }

    protected getUnitBonus(bonusType: UnitBonusType): number {
        const bonusId = this._bonusIdByBonusType?.get(bonusType)
        return bonusId == undefined ? 0 : getUnitBonus(this.object, bonusType, bonusId)
    }

    protected addOrUpdateOrRemoveUnitBonus(bonusType: UnitBonusType, value: number): void {
        let bonusIdByBonusType = this._bonusIdByBonusType
        if (bonusIdByBonusType == undefined) {
            bonusIdByBonusType = new LuaMap()
            this._bonusIdByBonusType = bonusIdByBonusType
        }

        bonusIdByBonusType.set(
            bonusType,
            addOrUpdateOrRemoveUnitBonus(
                this.object,
                bonusType,
                bonusIdByBonusType.get(bonusType),
                value,
            ),
        )
    }

    protected registerInRangeUnitEvent<T extends string, Args extends any[]>(
        this: UnitBehavior<PeriodicActionParameters> &
            Record<T, (this: this, ...args: Args) => unknown>,
        event: Event<[...Args]>,
        extractUnit: (...args: Args) => Unit | undefined,
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
            event.addListener((...args) => {
                const behaviors = behaviorsByEvent.get(event)
                if (behaviors !== undefined) {
                    const unit = extractUnit(...args)
                    if (unit !== undefined) {
                        for (const behavior of behaviors) {
                            const range = rangeByBehavior.get(behavior)
                            if (
                                range !== undefined &&
                                unit.getCollisionDistanceTo(behavior.unit) <= range
                            ) {
                                safeCall(
                                    (
                                        behavior as Record<
                                            T,
                                            (this: unknown, ...args: Args) => unknown
                                        >
                                    )[listenerByBehavior.get(behavior)! as T],
                                    behavior,
                                    ...args,
                                )
                            }
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

    public onAbilityWidgetTargetImpact(ability: Ability, target: Widget): void {
        // no-op
    }

    public onAbilityUnitTargetImpact(ability: Ability, target: Unit): void {
        // no-op
    }

    public onAbilityItemTargetImpact(ability: Ability, target: Item): void {
        // no-op
    }

    public onAbilityDestructibleTargetImpact(ability: Ability, target: Destructable): void {
        // no-op
    }

    public onAbilityPointTargetImpact(ability: Ability, x: number, y: number): void {
        // no-op
    }

    public onAbilityNoTargetImpact(ability: Ability): void {
        // no-op
    }

    public onAbilityChannelingFinish(ability: Ability): void {
        // no-op
    }

    public onAbilityStop(ability: Ability): void {
        // no-op
    }

    public onTargetingAbilityChannelingStart(ability: Ability, source: Unit): void {
        // no-op
    }

    public onTargetingAbilityImpact(ability: Ability, source: Unit): void {
        // no-op
    }

    public onBuffGained(buff: Buff): void {
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

    public onOwnerChange(previousOwner: Player): void {
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
        Unit.abilityUnitTargetChannelingStartEvent.addListener((source, ability, target) => {
            UnitBehavior.forAll(target, "onTargetingAbilityChannelingStart", ability, source)
        })
        Unit.abilityImpactEvent.addListener((source, ability) => {
            UnitBehavior.forAll(source, "onAbilityImpact", ability)
        })
        Unit.abilityWidgetTargetImpactEvent.addListener((source, ability, target) => {
            UnitBehavior.forAll(source, "onAbilityWidgetTargetImpact", ability, target)
        })
        Unit.abilityUnitTargetImpactEvent.addListener((source, ability, target) => {
            UnitBehavior.forAll(source, "onAbilityUnitTargetImpact", ability, target)
            UnitBehavior.forAll(target, "onTargetingAbilityImpact", ability, source)
        })
        Unit.abilityItemTargetImpactEvent.addListener((source, ability, target) => {
            UnitBehavior.forAll(source, "onAbilityItemTargetImpact", ability, target)
        })
        Unit.abilityDestructibleTargetImpactEvent.addListener((source, ability, target) => {
            UnitBehavior.forAll(source, "onAbilityDestructibleTargetImpact", ability, target)
        })
        Unit.abilityPointTargetImpactEvent.addListener((source, ability, x, y) => {
            UnitBehavior.forAll(source, "onAbilityPointTargetImpact", ability, x, y)
        })
        Unit.abilityNoTargetImpactEvent.addListener((source, ability) => {
            UnitBehavior.forAll(source, "onAbilityNoTargetImpact", ability)
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

        Unit.onOwnerChange.addListener((unit, previousOwner) => {
            UnitBehavior.forAll(unit, "onOwnerChange", previousOwner)
        })
    }
}

Unit.destroyEvent.addListener((unit) => {
    UnitBehavior.forAll(unit, "destroy")
})
