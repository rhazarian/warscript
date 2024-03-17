import { Unit } from "../unit"
import { castAbility } from "../mechanics/cast-ability"
import { BlinkAbilityType } from "../../object-data/entry/ability-type/blink"
import { MAXIMUM_INTEGER } from "../../../math"

const getUnitX = GetUnitX
const getUnitY = GetUnitY
const setUnitX = SetUnitX
const setUnitY = SetUnitY

const BLINK_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = BlinkAbilityType.create()
    abilityType.minimumRange = 0
    abilityType.maximumRange = MAXIMUM_INTEGER
    abilityType.manaCost = 0
    abilityType.cooldown = 0
    return abilityType.id
})

declare module "../unit" {
    interface Unit {
        detachMissiles(this: Unit): void
    }
}
Unit.prototype.detachMissiles = function () {
    const nativeUnit = this.handle
    const x = getUnitX(nativeUnit)
    const y = getUnitY(nativeUnit)
    castAbility(nativeUnit, BLINK_ABILITY_TYPE_ID)
    setUnitX(nativeUnit, x)
    setUnitY(nativeUnit, y)
}
