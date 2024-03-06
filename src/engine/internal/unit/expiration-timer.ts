import { Unit } from "../unit"

import { PhoenixMorphAbilityType } from "../../object-data/entry/ability-type/phoenix-morph"
import { BuffTypeId } from "../../object-data/entry/buff-type"

import { EventListenerPriority } from "../../../event"

const applyTimedLife = UnitApplyTimedLife
const cancelTimedLife = BlzUnitCancelTimedLife
const getWidgetLife = GetWidgetLife
const pauseTimedLife = UnitPauseTimedLife
const setWidgetLife = SetWidgetLife
const unitAddAbility = UnitAddAbility
const unitRemoveAbility = UnitRemoveAbility

declare module "../unit" {
    interface Unit {
        startExpirationTimer(this: Unit, duration: number, buffTypeId?: BuffTypeId): void
    }
}
Unit.prototype.startExpirationTimer = function (duration, buffTypeId) {
    applyTimedLife(this.handle, buffTypeId ?? fourCC("BTLF"), duration)
}

declare module "../unit" {
    interface Unit {
        removeExpirationTimer(this: Unit): void
    }
}
const dummyPhoenixMorphAbilityTypeId = compiletime(() => {
    const abilityType = PhoenixMorphAbilityType.create()
    abilityType.name = "Expiration Timer Dummy Ability"
    return abilityType.id
})
Unit.prototype.removeExpirationTimer = function () {
    const handle = this.handle
    unitAddAbility(handle, dummyPhoenixMorphAbilityTypeId)
    const life = getWidgetLife(handle)
    cancelTimedLife(handle)
    setWidgetLife(handle, life)
}
Unit.onImmediateOrder[orderId("phoenixmorph")].addListener(
    EventListenerPriority.HIGHEST,
    (unit) => {
        unitRemoveAbility(unit.handle, dummyPhoenixMorphAbilityTypeId)
    }
)

declare module "../unit" {
    interface Unit {
        pauseExpirationTimer(this: Unit): void
    }
}
Unit.prototype.pauseExpirationTimer = function () {
    pauseTimedLife(this.handle, true)
}

declare module "../unit" {
    interface Unit {
        resumeExpirationTimer(this: Unit): void
    }
}
Unit.prototype.resumeExpirationTimer = function () {
    pauseTimedLife(this.handle, false)
}
