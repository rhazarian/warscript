import { Unit, UnitWeapon } from "../unit"

const allowHeroGlowOnUnit = AllowHeroGlowOnUnit
const disallowHeroGlowOnUnit = DisallowHeroGlowOnUnit
const getUnitAnimationDuration = BlzGetUnitAnimationDuration
const getUnitAnimationDurationByIndex = BlzGetUnitAnimationDurationByIndex
const getUnitBooleanField = BlzGetUnitBooleanField
const getUnitRealField = BlzGetUnitRealField
const heroGlowIsAllowedOnUnit = HeroGlowIsAllowedOnUnit
const resetUnitAttack = BlzResetUnitAttack
const setUnitBooleanField = BlzSetUnitBooleanField
const setUnitRealField = BlzSetUnitRealField
const unitEnableAuras = BlzUnitEnableAuras

declare module "../unit" {
    interface Unit {
        getAnimationDuration(this: Unit, animation: string | number): number
        setAurasEnabled(this: Unit, enabled: boolean, affectsUI?: boolean): void
        isHeroGlowAllowed: boolean
        maximumFlyHeight: number
        showsAirToGroundIndicator: boolean
        alwaysDisplaysHealth: boolean
    }
    interface UnitWeapon {
        resetAttack(this: UnitWeapon): void
    }
}

Unit.prototype.getAnimationDuration = function (animation: string | number): number {
    if (typeof animation === "number") {
        return getUnitAnimationDurationByIndex(this.handle, animation)
    }
    return getUnitAnimationDuration(this.handle, animation)
}

Unit.prototype.setAurasEnabled = function (enabled: boolean, affectsUI = true): void {
    unitEnableAuras(this.handle, enabled, affectsUI)
}

Object.defineProperty(Unit.prototype, "isHeroGlowAllowed", {
    get(this: Unit): boolean {
        return heroGlowIsAllowedOnUnit(this.handle)
    },
    set(this: Unit, allowed: boolean) {
        if (allowed) {
            allowHeroGlowOnUnit(this.handle)
        } else {
            disallowHeroGlowOnUnit(this.handle)
        }
    },
})

Object.defineProperty(Unit.prototype, "maximumFlyHeight", {
    get(this: Unit): number {
        return getUnitRealField(this.handle, UNIT_RF_FLY_MAX_HEIGHT)
    },
    set(this: Unit, height: number) {
        setUnitRealField(this.handle, UNIT_RF_FLY_MAX_HEIGHT, height)
    },
})

Object.defineProperty(Unit.prototype, "showsAirToGroundIndicator", {
    get(this: Unit): boolean {
        return getUnitBooleanField(this.handle, UNIT_BF_SHOW_AIR_TO_GROUND)
    },
    set(this: Unit, show: boolean) {
        setUnitBooleanField(this.handle, UNIT_BF_SHOW_AIR_TO_GROUND, show)
    },
})

Object.defineProperty(Unit.prototype, "alwaysDisplaysHealth", {
    get(this: Unit): boolean {
        return getUnitBooleanField(this.handle, UNIT_BF_FORCE_DISPLAY_HP)
    },
    set(this: Unit, show: boolean) {
        setUnitBooleanField(this.handle, UNIT_BF_FORCE_DISPLAY_HP, show)
    },
})

UnitWeapon.prototype.resetAttack = function (): void {
    resetUnitAttack(this.unit.handle, this.index)
}
