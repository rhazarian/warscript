import { Unit } from "./unit"

import { Event } from "../../event"
import { Timer } from "../../core/types/timer"
import { luaSetOf } from "../../utility/lua-sets"

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

const timerCallback = (source: Unit, target: Unit): void => {
    eventTimerByUnit.delete(source)
    Event.invoke(autoAttackFinishEvent, source, target)
}

Unit.autoAttackStartEvent.addListener((source, target) => {
    const attackPoint = (source.chooseWeapon(target) ?? source.firstWeapon).impactDelay
    const timer = Timer.simple(attackPoint, timerCallback, source, target)
    eventTimerByUnit.set(source, timer)
})
