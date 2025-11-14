import { Unit } from "./unit"

import { Event, EventListenerPriority } from "../../event"
import { Timer } from "../../core/types/timer"
import { luaSetOf } from "../../utility/lua-sets"
import { attribute } from "../../attributes"

declare module "./unit" {
    namespace Unit {
        const autoAttackFinishEvent: Event<[source: Unit, target: Unit]>
    }
}
const autoAttackFinishEvent = new Event<[source: Unit, target: Unit]>()
rawset(Unit, "autoAttackFinishEvent", autoAttackFinishEvent)

const eventTimerByUnit = new LuaMap<Unit, Timer>()

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
    if (!instantOrderIds.has(orderId)) {
        const eventTimer = eventTimerByUnit.get(source)
        if (eventTimer) {
            eventTimer.destroy()
            eventTimerByUnit.delete(source)
        }
    }
}

// TODO: abilities? custom abilities with berserk/immolation/etc order ids...

Unit.onImmediateOrder.addListener(reset)

Unit.onPointOrder.addListener(reset)

Unit.onTargetOrder.addListener(reset)

const targetAttribute = attribute<Unit>()
const impactDelayAttribute = attribute<number>()
const passedTimeAttribute = attribute<number>()

let unitsSize = 0
const units: Unit[] = []

const timerPeriod = 1 / 64

Timer.onPeriod[timerPeriod].addListener(() => {
    for (let i = 1; i <= unitsSize; i++) {
        const unit = units[i - 1]
        const passedTime = unit.get(passedTimeAttribute)! + timerPeriod
        if (passedTime >= unit.get(impactDelayAttribute)!) {
            units[i - 1] = units[unitsSize]
            units[unitsSize] = undefined!
            unitsSize--
            i--
            const target = unit.get(targetAttribute)!
            unit.set(targetAttribute, undefined)
            unit.set(impactDelayAttribute, undefined)
            unit.set(passedTimeAttribute, undefined)
            Event.invoke(autoAttackFinishEvent, unit, target)
        } else {
            unit.set(passedTimeAttribute, passedTime)
        }
    }
})

Unit.autoAttackStartEvent.addListener(EventListenerPriority.HIGHEST_INTERNAL, (source, target) => {
    const previousTarget = source.get(targetAttribute)
    if (previousTarget != undefined) {
        Event.invoke(autoAttackFinishEvent, source, target)
    } else {
        unitsSize++
        units[unitsSize - 1] = source
    }
    source.set(targetAttribute, target)
    source.set(
        impactDelayAttribute,
        (source.chooseWeapon(target) ?? source.firstWeapon).impactDelay,
    )
    source.set(passedTimeAttribute, -timerPeriod)
})
