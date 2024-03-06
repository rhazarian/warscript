import { Unit } from "../unit"
import { GHOST_VISIBLE_DUMMY_ABILITY_TYPE_ID } from "../object-data/ghost-visible"

const unitAddAbility = UnitAddAbility
const unitMakeAbilityPermanent = UnitMakeAbilityPermanent
const unitRemoveAbility = UnitRemoveAbility

const ghostCounterByUnit = setmetatable(new LuaMap<Unit, number>(), { __mode: "k" })

declare module "../unit" {
    interface Unit {
        incrementGhostCounter(): void
    }
}
Unit.prototype.incrementGhostCounter = function () {
    const ghostCounter = ghostCounterByUnit.get(this) ?? 0
    if (ghostCounter == 0) {
        const handle = this.handle
        unitAddAbility(handle, GHOST_VISIBLE_DUMMY_ABILITY_TYPE_ID)
        unitMakeAbilityPermanent(handle, true, GHOST_VISIBLE_DUMMY_ABILITY_TYPE_ID)
    }
    ghostCounterByUnit.set(this, ghostCounter + 1)
}

declare module "../unit" {
    interface Unit {
        decrementGhostCounter(): void
    }
}
Unit.prototype.decrementGhostCounter = function () {
    const ghostCounter = ghostCounterByUnit.get(this) ?? 0
    if (ghostCounter == 1) {
        unitRemoveAbility(this.handle, GHOST_VISIBLE_DUMMY_ABILITY_TYPE_ID)
    }
    ghostCounterByUnit.set(this, ghostCounter - 1)
}
