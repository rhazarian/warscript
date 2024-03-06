import { Unit } from "./unit"

import {
    ARMOR_BONUS_DUMMY_ABILITY_FIELD,
    ARMOR_BONUS_DUMMY_ABILITY_TYPE_ID,
} from "./object-data/armor-increase"

const getUnitAbility = BlzGetUnitAbility
const setAbilityRealLevelField = BlzSetAbilityRealLevelField
const unitAddAbility = UnitAddAbility
const unitMakeAbilityPermanent = UnitMakeAbilityPermanent
const unitRemoveAbility = UnitRemoveAbility

declare module "./unit" {
    interface Unit {
        armorBonus: number
        armorBonusFactor: number
    }
}

const bonusArmorByUnit = setmetatable(new LuaMap<Unit, number>(), { __mode: "k" })

Object.defineProperty(Unit.prototype, "armorBonus", {
    get(this: Unit): number {
        return bonusArmorByUnit.get(this) ?? 0
    },
    set(this: Unit, bonusArmor: number): void {
        const unitHandle = this.handle
        if (bonusArmor == 0) {
            if (unitRemoveAbility(unitHandle, bonusArmor)) {
                bonusArmorByUnit.set(this, 0)
            }
            return
        }
        if (unitAddAbility(unitHandle, ARMOR_BONUS_DUMMY_ABILITY_TYPE_ID)) {
            unitMakeAbilityPermanent(unitHandle, true, ARMOR_BONUS_DUMMY_ABILITY_TYPE_ID)
        }
        const abilityHandle = getUnitAbility(unitHandle, ARMOR_BONUS_DUMMY_ABILITY_TYPE_ID)
        if (
            abilityHandle &&
            setAbilityRealLevelField(abilityHandle, ARMOR_BONUS_DUMMY_ABILITY_FIELD, 0, bonusArmor)
        ) {
            bonusArmorByUnit.set(this, bonusArmor)
        }
    },
})
