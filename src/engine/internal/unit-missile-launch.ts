import { Unit } from "./unit"

import { Event } from "../../event"
import { Timer } from "../../core/types/timer"

declare module "./unit" {
    namespace Unit {
        const autoAttackFinishEvent: Event<[source: Unit, target: Unit]>
    }
}
const autoAttackFinishEvent = new Event<[source: Unit, target: Unit]>()
rawset(Unit, "autoAttackFinishEvent", autoAttackFinishEvent)

const eventTimerByUnit = new LuaMap<Unit, Timer>()

const reset = (source: Unit) => {
    const eventTimer = eventTimerByUnit.get(source)
    if (eventTimer) {
        eventTimer.destroy()
        eventTimerByUnit.delete(source)
    }
}

// TODO: divine shield? berserk? ...
Unit.onImmediateOrder.addListener(reset)

Unit.onPointOrder.addListener(reset)

Unit.onTargetOrder.addListener(reset)

const timerCallback = (source: Unit, target: Unit): void => {
    eventTimerByUnit.delete(source)
    Event.invoke(autoAttackFinishEvent, source, target)
}

Unit.autoAttackStartEvent.addListener((source, target) => {
    // TODO: deduce weapon index properly.
    const attackPoint = source.weapons[0].impactDelay
    const timer = Timer.simple(attackPoint, timerCallback, source, target)
    eventTimerByUnit.set(source, timer)
})
