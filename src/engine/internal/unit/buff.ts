import { checkBuff, checkBuffs } from "../../buff"
import { BuffPolarity } from "../../object-data/auxiliary/buff-polarity"
import { BuffResistanceType } from "../../object-data/auxiliary/buff-resistance-type"

import { Unit } from "../unit"
import { removeBuff } from "../../object-data/entry/buff-type/applicable"

const getUnitAbilityLevel = GetUnitAbilityLevel
const unitCountBuffsEx = UnitCountBuffsEx
const unitRemoveAbility = UnitRemoveAbility
const unitRemoveBuffsEx = UnitRemoveBuffsEx

declare module "../unit" {
    interface Unit {
        hasBuff(buffTypeId: number): boolean
    }
}
Unit.prototype.hasBuff = function (buffTypeId) {
    return getUnitAbilityLevel(this.handle, buffTypeId) > 0
}

declare module "../unit" {
    interface Unit {
        removeBuff(buffTypeId: number): boolean
    }
}
Unit.prototype.removeBuff = function (buffTypeId) {
    if (removeBuff(this.handle, buffTypeId)) {
        checkBuff(this, buffTypeId)
        return true
    }
    return false
}

declare module "../unit" {
    interface Unit {
        /**
         * @param polarity The polarity of buffs to count. Default `undefined`.
         * @param resistanceType The resistance type of buffs to count. Default `undefined`.
         * @param includeExpirationTimers Whether to include expiration timer buffs. Default `true`.
         * @param includeAuras Whether to remove aura buffs. Default `true`.
         * @param autoDispel Unknown. Default `false`.
         */
        countBuffs(
            polarity?: BuffPolarity,
            resistanceType?: BuffResistanceType,
            includeExpirationTimers?: boolean,
            includeAuras?: boolean,
            autoDispel?: boolean
        ): number
    }
}

Unit.prototype.countBuffs = function (
    polarity = undefined,
    resistanceType = undefined,
    includeExpirationTimers = true,
    includeAuras = true,
    autoDispel = false
) {
    return unitCountBuffsEx(
        this.handle,
        ((polarity ?? 0b11) & BuffPolarity.POSITIVE) != 0,
        ((polarity ?? 0b11) & BuffPolarity.NEGATIVE) != 0,
        ((resistanceType ?? 0b00) & BuffResistanceType.MAGIC) != 0,
        ((resistanceType ?? 0b00) & BuffResistanceType.PHYSICAL) != 0,
        includeExpirationTimers,
        includeAuras,
        autoDispel
    )
}

declare module "../unit" {
    interface Unit {
        /**
         * @param polarity The polarity of buffs to remove. Default `undefined`.
         * @param resistanceType The resistance type of buffs to remove. Default `undefined`.
         * @param includeExpirationTimers Whether to include expiration timer buffs. Default `true`.
         * @param includeAuras Whether to remove aura buffs. Default `true`.
         * @param autoDispel Unknown. Default `false`.
         */
        removeBuffs(
            polarity?: BuffPolarity,
            resistanceType?: BuffResistanceType,
            includeExpirationTimers?: boolean,
            includeAuras?: boolean,
            autoDispel?: boolean
        ): number

        removeBuffs(buffTypeIds: number[]): number
    }
}
Unit.prototype.removeBuffs = function (
    polarityOrBuffTypeIds = undefined,
    resistanceType?: BuffResistanceType,
    includeExpirationTimers?: boolean,
    includeAuras?: boolean,
    autoDispel?: boolean
): number {
    const handle = this.handle
    let cnt: number
    if (typeof polarityOrBuffTypeIds == "object") {
        cnt = 0
        for (const i of $range(1, polarityOrBuffTypeIds.length)) {
            cnt += unitRemoveAbility(handle, polarityOrBuffTypeIds[i - 1]) ? 1 : 0
        }
    } else {
        const positive = ((polarityOrBuffTypeIds ?? 0b11) & BuffPolarity.POSITIVE) != 0
        const negative = ((polarityOrBuffTypeIds ?? 0b11) & BuffPolarity.NEGATIVE) != 0
        const magic = ((resistanceType ?? 0b00) & BuffResistanceType.MAGIC) != 0
        const physical = ((resistanceType ?? 0b00) & BuffResistanceType.PHYSICAL) != 0
        includeExpirationTimers = includeExpirationTimers ?? true
        includeAuras = includeAuras ?? true
        autoDispel = autoDispel ?? false
        cnt = unitCountBuffsEx(
            handle,
            positive,
            negative,
            magic,
            physical,
            includeExpirationTimers,
            includeAuras,
            autoDispel,
        )
        unitRemoveBuffsEx(
            handle,
            positive,
            negative,
            magic,
            physical,
            includeExpirationTimers,
            includeAuras,
            autoDispel,
        )
    }
    checkBuffs(this)
    return cnt
}
