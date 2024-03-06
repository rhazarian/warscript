import { Unit } from "../unit"
import { AbilityTypeId } from "../../object-data/entry/ability-type"
import {
    ARMOR_BONUS_DUMMY_ABILITY_FIELD,
    ARMOR_BONUS_DUMMY_ABILITY_TYPE_ID,
} from "../object-data/armor-increase"
import { addInternalAbility } from "../utility"

import { product, sum } from "../../../utility/arrays"
import {
    AUTO_ATTACK_SPEED_INCREASE_DUMMY_ABILITY_TYPE_ID,
    AUTO_ATTACK_SPEED_INCREASE_FACTOR_ABILITY_FIELD,
} from "../object-data/auto-attack-speed-increase"
import { check, checkNotNull } from "../../../utility/preconditions"
import {
    AUTO_ATTACK_DAMAGE_INCREASE_ABILITY_FIELD,
    AUTO_ATTACK_DAMAGE_INCREASE_DUMMY_ABILITY_TYPE_ID,
} from "../object-data/auto-attack-damage-increase"
import { EventListenerPriority } from "../../../event"
import {
    MOVEMENT_SPEED_INCREASE_FACTOR_ABILITY_FIELD,
    MOVEMENT_SPEED_INCREASE_FACTOR_DUMMY_ABILITY_TYPE_ID
} from "../object-data/movement-speed-increase-factor"

export type UnitBonusId<Brand extends string = any> = number & {
    readonly __unitBonusId: unique symbol
    readonly __unitBonusIdBrand: Brand
}

export type UnitArmorBonusId = UnitBonusId<"armor">
export type UnitAttackSpeedFactorBonusId = UnitBonusId<"attackSpeedFactor">
export type UnitMovementSpeedFactorBonusId = UnitBonusId<"movementSpeedFactor">
export type UnitDamageBonusId = UnitBonusId<"damage">
export type UnitReceivedDamageFactorBonusId = UnitBonusId<"receivedDamageFactor">

export type UnitBonusType<Id extends UnitBonusId = UnitBonusId> = (
    | {
          abilityTypeId: AbilityTypeId
          field: jabilityintegerlevelfield
          integer: true
      }
    | {
          abilityTypeId: AbilityTypeId
          field: jabilityreallevelfield
          integer: false
      }
    | {
          abilityTypeId?: undefined
          valueByUnit: LuaMap<Unit, number>
      }
) & {
    reduce: (this: void, array: number[]) => number
    initialValue: number
    readonly __unitBonusTypeId?: Id
}

const receivedDamageFactorByUnit = new LuaMap<Unit, number>()

export namespace UnitBonusType {
    export const ARMOR: UnitBonusType<UnitArmorBonusId> = {
        abilityTypeId: ARMOR_BONUS_DUMMY_ABILITY_TYPE_ID,
        field: ARMOR_BONUS_DUMMY_ABILITY_FIELD,
        integer: false,
        reduce: sum,
        initialValue: 0,
    }
    export const ATTACK_SPEED_FACTOR: UnitBonusType<UnitAttackSpeedFactorBonusId> = {
        abilityTypeId: AUTO_ATTACK_SPEED_INCREASE_DUMMY_ABILITY_TYPE_ID,
        field: AUTO_ATTACK_SPEED_INCREASE_FACTOR_ABILITY_FIELD,
        integer: false,
        reduce: sum,
        initialValue: 0,
    }
    export const MOVEMENT_SPEED_FACTOR: UnitBonusType<UnitAttackSpeedFactorBonusId> = {
        abilityTypeId: MOVEMENT_SPEED_INCREASE_FACTOR_DUMMY_ABILITY_TYPE_ID,
        field: MOVEMENT_SPEED_INCREASE_FACTOR_ABILITY_FIELD,
        integer: false,
        reduce: sum,
        initialValue: 0,
    }
    export const DAMAGE: UnitBonusType<UnitDamageBonusId> = {
        abilityTypeId: AUTO_ATTACK_DAMAGE_INCREASE_DUMMY_ABILITY_TYPE_ID,
        field: AUTO_ATTACK_DAMAGE_INCREASE_ABILITY_FIELD,
        integer: false,
        reduce: sum,
        initialValue: 0,
    }
    export const RECEIVED_DAMAGE_FACTOR: UnitBonusType<UnitReceivedDamageFactorBonusId> = {
        reduce: product,
        valueByUnit: receivedDamageFactorByUnit,
        initialValue: 1,
    }
}

type UnitBonuses = {
    array: number[]
    idByIndex: LuaMap<number, number | undefined>
    indexById: LuaMap<number, number | undefined>
}

const bonusesByUnitByBonusType = new LuaMap<UnitBonusType, LuaMap<Unit, UnitBonuses>>()

let nextId = 1

const processUnitBonus = (unit: Unit, bonusType: UnitBonusType, bonusesArray: number[]): void => {
    const unitHandle = unit.handle

    const totalValue = bonusType.reduce(bonusesArray)

    const abilityTypeId = bonusType.abilityTypeId
    if (abilityTypeId == undefined) {
        const valueByUnit = bonusType.valueByUnit
        if (totalValue == bonusType.initialValue) {
            valueByUnit.delete(unit)
        } else {
            valueByUnit.set(unit, totalValue)
        }
        return
    }

    if (totalValue == bonusType.initialValue) {
        UnitRemoveAbility(unitHandle, abilityTypeId)
        return
    }

    const abilityHandle = checkNotNull(addInternalAbility(unitHandle, abilityTypeId))
    check(
        (bonusType.integer ? BlzSetAbilityIntegerLevelField : BlzSetAbilityRealLevelField)(
            abilityHandle,
            bonusType.field as any,
            0,
            totalValue
        )
    )
    BlzSetAbilityIntegerField(abilityHandle, ABILITY_IF_LEVELS, 2)
    SetUnitAbilityLevel(unitHandle, abilityTypeId, 2)
    SetUnitAbilityLevel(unitHandle, abilityTypeId, 1)
    BlzSetAbilityIntegerField(abilityHandle, ABILITY_IF_LEVELS, 1)
}

export const addUnitBonus = <Id extends UnitBonusId>(
    unit: Unit,
    bonusType: UnitBonusType<Id>,
    value: number
): Id => {
    let bonusesByUnit = bonusesByUnitByBonusType.get(bonusType)
    if (bonusesByUnit == undefined) {
        bonusesByUnit = setmetatable(new LuaMap<Unit, UnitBonuses>(), { __mode: "k" })
        bonusesByUnitByBonusType.set(bonusType, bonusesByUnit)
    }

    let bonuses = bonusesByUnit.get(unit)
    if (bonuses == undefined) {
        bonuses = {
            array: [],
            idByIndex: new LuaMap(),
            indexById: new LuaMap(),
        }
        bonusesByUnit.set(unit, bonuses)
    }

    const bonusesArray = bonuses.array

    const id = nextId++
    const index = bonusesArray.length
    bonusesArray[index] = value
    bonuses.idByIndex.set(index, id)
    bonuses.indexById.set(id, index)

    processUnitBonus(unit, bonusType, bonusesArray)

    return id as Id
}

export const removeUnitBonus = <Id extends UnitBonusId>(
    unit: Unit,
    bonusType: UnitBonusType<Id>,
    id: Id
): boolean => {
    const bonusesByUnit = bonusesByUnitByBonusType.get(bonusType)
    if (bonusesByUnit == undefined) {
        return false
    }

    const bonuses = bonusesByUnit.get(unit)
    if (bonuses == undefined) {
        return false
    }

    const index = bonuses.indexById.get(id)
    if (index == undefined) {
        return false
    }

    const bonusesArray = bonuses.array
    const bonusesArrayLastIndex = bonusesArray.length - 1
    const bonusesIdByIndex = bonuses.idByIndex
    const bonusesIndexById = bonuses.indexById

    bonusesArray[index] = bonusesArray[bonusesArrayLastIndex]
    bonusesArray[bonusesArrayLastIndex] = undefined!
    const lastElementId = checkNotNull(bonuses.idByIndex.get(bonusesArrayLastIndex))
    bonusesIdByIndex.set(index, lastElementId)
    bonusesIdByIndex.delete(bonusesArrayLastIndex)
    bonusesIndexById.set(lastElementId, index)
    bonusesIndexById.delete(id)

    processUnitBonus(unit, bonusType, bonusesArray)

    return true
}

export const updateUnitBonus = <Id extends UnitBonusId>(
    unit: Unit,
    bonusType: UnitBonusType<Id>,
    id: Id,
    value: number
): boolean => {
    const bonusesByUnit = bonusesByUnitByBonusType.get(bonusType)
    if (bonusesByUnit == undefined) {
        return false
    }

    const bonuses = bonusesByUnit.get(unit)
    if (bonuses == undefined) {
        return false
    }

    const index = bonuses.indexById.get(id)
    if (index == undefined) {
        return false
    }

    const bonusesArray = bonuses.array

    bonusesArray[index] = value

    processUnitBonus(unit, bonusType, bonusesArray)

    return true
}

export const addOrUpdateOrRemoveUnitBonus = <Id extends UnitBonusId>(
    unit: Unit,
    bonusType: UnitBonusType<Id>,
    id: Id | undefined,
    value: number
): Id | undefined => {
    if (value == bonusType.initialValue) {
        if (id == undefined) {
            return undefined
        }
        removeUnitBonus(unit, bonusType, id)
        return undefined
    }
    if (id == undefined) {
        return addUnitBonus(unit, bonusType, value)
    }
    check(updateUnitBonus(unit, bonusType, id, value))
    return id
}

export const getUnitBonus = <Id extends UnitBonusId>(
    unit: Unit,
    bonusType: UnitBonusType<Id>,
    id: Id
): number => {
    const bonusesByUnit = bonusesByUnitByBonusType.get(bonusType)
    if (bonusesByUnit == undefined) {
        return bonusType.initialValue
    }

    const bonuses = bonusesByUnit.get(unit)
    if (bonuses == undefined) {
        return bonusType.initialValue
    }

    const index = bonuses.indexById.get(id)
    if (index == undefined) {
        return bonusType.initialValue
    }

    return bonuses.array[index]
}

Unit.onDamage.addListener(EventListenerPriority.HIGHEST, (source, target, event) => {
    if (receivedDamageFactorByUnit.has(target)) {
        event.amount *= receivedDamageFactorByUnit.get(target)!
    }
})
