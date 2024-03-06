import { Unit } from "../unit"

import { Event } from "../../../event"
import { clamp } from "../../../math"

const getUnitDefaultMovementSpeed = GetUnitDefaultMoveSpeed
const getUnitMovementSpeed = GetUnitMoveSpeed
const setUnitMovementSpeed = SetUnitMoveSpeed

const MAXIMUM_MOVEMENT_SPEED = 522.0
const MINIMUM_MOVEMENT_SPEED = 1.0

declare module "../unit" {
    namespace Unit {
        const baseMovementSpeedChangedEvent: Event<
            [unit: Unit, previousValue: number, newValue: number]
        >
    }
    interface Unit {
        /** The current movement speed excluding bonuses. */
        movementSpeedBase: number
        readonly movementSpeedBonus: number
        /** The current movement speed including bonuses. */
        readonly movementSpeed: number
    }
}

const baseMovementSpeedChangedEvent = new Event<
    [unit: Unit, previousValue: number, newValue: number]
>()
rawset(Unit, "baseMovementSpeedChangedEvent", baseMovementSpeedChangedEvent)

const baseMovementSpeedByUnit = setmetatable(new LuaMap<Unit, number>(), { __mode: "k" })

Object.defineProperty(Unit.prototype, "baseMovementSpeed", {
    get(this: Unit): number {
        return baseMovementSpeedByUnit.get(this) ?? getUnitDefaultMovementSpeed(this.handle)
    },
    set(this: Unit, baseMovementSpeed: number): void {
        setUnitMovementSpeed(this.handle, baseMovementSpeed)
        const oldBaseMovementSpeed =
            baseMovementSpeedByUnit.get(this) ?? getUnitDefaultMovementSpeed(this.handle)
        const newBaseMovementSpeed = clamp(
            baseMovementSpeed,
            MINIMUM_MOVEMENT_SPEED,
            MAXIMUM_MOVEMENT_SPEED
        )
        baseMovementSpeedByUnit.set(this, newBaseMovementSpeed)
        Event.invoke(
            baseMovementSpeedChangedEvent,
            this,
            oldBaseMovementSpeed,
            newBaseMovementSpeed
        )
    },
})

Object.defineProperty(Unit.prototype, "movementSpeed", {
    get(this: Unit): number {
        return getUnitMovementSpeed(this.handle)
    },
})

// TODO: upgrades
