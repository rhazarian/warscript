import { DependentInitializingEvent, Event, EventListenerPriority } from "../../../event"
import { Unit, UnitTriggerEvent } from "../unit"

const getTriggerUnit = GetTriggerUnit
const getSummoningUnit = GetSummoningUnit

const internalSummonEvent = new UnitTriggerEvent(EVENT_PLAYER_UNIT_SUMMON, () => {
    return $multi(Unit.of(getTriggerUnit())!, Unit.of(getSummoningUnit()))
})

declare module "../unit" {
    namespace Unit {
        const summonEvent: Event<[summoningUnit: Unit, summonedUnit: Unit]>
    }
}
rawset(
    Unit,
    "summonEvent",
    new DependentInitializingEvent(
        internalSummonEvent,
        EventListenerPriority.HIGHEST,
        (summonedUnit, summoningUnit) => {
            if (summonedUnit != undefined && summoningUnit != undefined) {
                return $multi(true, summoningUnit, summonedUnit)
            } else {
                return $multi(false)
            }
        }
    )
)

declare module "../unit" {
    namespace Unit {
        const summonedEvent: Event<[summonedUnit: Unit, summoningUnit?: Unit]>
    }
}
rawset(
    Unit,
    "summonedEvent",
    new DependentInitializingEvent(
        internalSummonEvent,
        EventListenerPriority.HIGH,
        (summonedUnit, summoningUnit) => {
            if (summonedUnit != undefined) {
                return $multi(true, summonedUnit, summoningUnit)
            } else {
                return $multi(false)
            }
        }
    )
)
