import { Unit } from "./unit"

import { Event, EventListenerPriority } from "../../event"
import { Timer } from "../../core/types/timer"
import { luaSetOf } from "../../utility/lua-sets"
import { attribute } from "../../attributes"
import { LinkedSet } from "../../utility/linked-set"
import { ceil } from "../../math"

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
    orderId("avatar"),
    orderId("berserk"),
    orderId("divineshield"),
    orderId("immolation"),
    orderId("moveslot0"),
    orderId("moveslot1"),
    orderId("moveslot2"),
    orderId("moveslot3"),
    orderId("moveslot4"),
    orderId("moveslot5"),
    orderId("unavatar"),
    orderId("undivineshield"),
    orderId("unimmolation"),
)

const reset = (source: Unit, orderId: number) => {
    if (!instantOrderIds.has(orderId) && units.remove(source)) {
        source.set(targetAttribute, undefined)
        source.set(impactDelayAttribute, undefined)
        source.set(passedTimeAttribute, undefined)
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
