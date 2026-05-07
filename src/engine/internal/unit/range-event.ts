import { Event, EventListenerPriority, InitializingEvent, TriggerEvent } from "../../../event"
import { Unit } from "../unit"
import { Timer } from "../../../core/types/timer"
import { attribute } from "../../../attributes"
import { LinkedMap, mutableLinkedMap } from "../../../utility/linked-map"
import { LinkedSet, mutableLinkedSet } from "../../../utility/linked-set"

const getTriggerUnit = GetTriggerUnit
const triggerRegisterUnitInRange = TriggerRegisterUnitInRange

const eventInvoke = Event.invoke

declare module "../unit" {
    interface Unit {
        readonly unitInRangeEvent: Record<
            number,
            Event<[unit: Unit, range: number, unitInRange: Unit]>
        >
    }
}
Object.defineProperty(Unit.prototype, "unitInRangeEvent", {
    get(this: Unit): Record<number, Event<[unit: Unit, range: number, unitInRange: Unit]>> {
        const unit = this
        const handle = this.handle
        const unitInRangeEvent = setmetatable(new LuaTable<number, Event<[Unit, number, Unit]>>(), {
            __index(value: number): Event<[Unit, number, Unit]> {
                const event = new TriggerEvent(
                    (trigger) => {
                        triggerRegisterUnitInRange(trigger, handle, value, null!)
                    },
                    () => $multi(unit, value, Unit.of(getTriggerUnit())!),
                )
                rawset(this, value, event)
                return event
            },
        })
        rawset(this, "unitInRangeEvent", unitInRangeEvent)
        return unitInRangeEvent
    },
})

const units = new LinkedSet<Unit>()
const unitsInRangeByRangeAttribute = attribute<LinkedMap<number, LinkedSet<Unit>>>()

const registerUnitOfRangeEvent = (unit: Unit, range: number, unitInRange: Unit): void => {
    units.add(unit)
    unit.getOrPut(unitsInRangeByRangeAttribute, mutableLinkedMap)
        .getOrPut(range, mutableLinkedSet)
        .add(unitInRange)
}

declare module "../unit" {
    interface Unit {
        readonly unitOutOfRangeEvent: Record<
            number,
            Event<[unit: Unit, range: number, unitOutOfRange: Unit]>
        >
    }
}
Object.defineProperty(Unit.prototype, "unitOutOfRangeEvent", {
    get(this: Unit): Record<number, Event<[unit: Unit, range: number, unitInRange: Unit]>> {
        const unit = this
        const unitOutOfRangeEvent = setmetatable(
            new LuaTable<number, Event<[Unit, number, Unit]>>(),
            {
                __index(value: number): Event<[Unit, number, Unit]> {
                    const event = new InitializingEvent<[Unit, number, Unit]>(() => {
                        unit.unitInRangeEvent[value].addListener(
                            EventListenerPriority.HIGHEST_INTERNAL,
                            registerUnitOfRangeEvent,
                        )
                    })
                    rawset(this, value, event)
                    return event
                },
            },
        )
        rawset(this, "unitOutOfRangeEvent", unitOutOfRangeEvent)
        return unitOutOfRangeEvent
    },
})

Timer.onPeriod[1].addListener(() => {
    for (const unit of units) {
        const unitsInRangeByRange = unit.get(unitsInRangeByRangeAttribute)
        if (unitsInRangeByRange !== undefined) {
            for (const [range, unitsInRange] of unitsInRangeByRange) {
                for (const unitInRange of unitsInRange) {
                    if (unit.getDistanceTo(unitInRange) > range) {
                        unitsInRange.remove(unitInRange)
                        eventInvoke(unit.unitOutOfRangeEvent[range], unit, range, unitInRange)
                    }
                }
            }
        }
    }
})
