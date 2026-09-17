import { Unit } from "./unit"

import { Event, EventListenerPriority } from "../../event"
import { Timer } from "../../core/types/timer"
import { luaSetOf } from "../../utility/lua-sets"
import { attribute } from "../../attributes"
import { LinkedSet } from "../../utility/linked-set"
import { ceil } from "../../math"
import { OrderType } from "../object-data/auxiliary/order-type"

declare module "./unit" {
    namespace Unit {
        const autoAttackFinishEvent: Event<[source: Unit, target: Unit]>
    }
}
const autoAttackFinishEvent = new Event<[source: Unit, target: Unit]>()
rawset(Unit, "autoAttackFinishEvent", autoAttackFinishEvent)

const units = new LinkedSet<Unit>()

const targetAttribute = attribute<Unit>()
const impactDelayAttribute = attribute<number>()
const passedTimeAttribute = attribute<number>()

const instantOrderIds = luaSetOf(
    OrderType.AVATAR,
    OrderType.BERSERK,
    OrderType.DIVINE_SHIELD,
    OrderType.IMMOLATION,
    OrderType.MOVE_SLOT_0,
    OrderType.MOVE_SLOT_1,
    OrderType.MOVE_SLOT_2,
    OrderType.MOVE_SLOT_3,
    OrderType.MOVE_SLOT_4,
    OrderType.MOVE_SLOT_5,
    OrderType.UN_AVATAR,
    OrderType.UN_DIVINE_SHIELD,
    OrderType.UN_IMMOLATION,
)

/** @internal For use by internal systems only. */
export const resetAutoAttackTimer = (unit: Unit) => {
    if (units.remove(unit)) {
        unit.set(targetAttribute, undefined)
        unit.set(impactDelayAttribute, undefined)
        unit.set(passedTimeAttribute, undefined)
    }
}

const reset = (unit: Unit, orderId: number) => {
    if (!instantOrderIds.has(orderId)) {
        resetAutoAttackTimer(unit)
    }
}

// TODO: abilities? custom abilities with berserk/immolation/etc order ids...

Unit.onImmediateOrder.addListener(reset)

Unit.onPointOrder.addListener(reset)

Unit.onTargetOrder.addListener(reset)

const timerPeriod = 1 / 64

const invokeEvent = (unit: Unit) => {
    units.remove(unit)
    const target = unit.get(targetAttribute)!
    unit.set(targetAttribute, undefined)
    unit.set(impactDelayAttribute, undefined)
    unit.set(passedTimeAttribute, undefined)
    Event.invoke(autoAttackFinishEvent, unit, target)
}

const checkUnit = (unit: Unit) => {
    const passedTime = unit.get(passedTimeAttribute)! + timerPeriod
    const impactDelay = unit.get(impactDelayAttribute)!
    if (passedTime >= impactDelay && ceil(passedTime / 0.02) >= ceil(impactDelay / 0.02)) {
        invokeEvent(unit)
    } else {
        unit.set(passedTimeAttribute, passedTime)
    }
}

Timer.onPeriod[timerPeriod].addListener(() => {
    units.forEach(checkUnit)
})

Unit.autoAttackStartEvent.addListener(EventListenerPriority.HIGHEST_INTERNAL, (source, target) => {
    if (source.get(targetAttribute) != undefined) {
        invokeEvent(source)
    }
    source.set(targetAttribute, target)
    source.set(
        impactDelayAttribute,
        (source.chooseWeapon(target) ?? source.firstWeapon).impactDelay,
    )
    source.set(passedTimeAttribute, -timerPeriod)
    units.add(source)
})
