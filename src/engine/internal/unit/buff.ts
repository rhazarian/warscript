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
        ): void

        removeBuffs(buffTypeIds: number[]): void
    }
}
Unit.prototype.removeBuffs = function (
    polarityOrBuffTypeIds = undefined,
    resistanceType?: BuffResistanceType,
    includeExpirationTimers?: boolean,
    includeAuras?: boolean,
    autoDispel?: boolean
) {
    if (typeof polarityOrBuffTypeIds == "object") {
        const handle = this.handle
        for (const i of $range(1, polarityOrBuffTypeIds.length)) {
            unitRemoveAbility(handle, polarityOrBuffTypeIds[i - 1])
        }
    } else {
        unitRemoveBuffsEx(
            this.handle,
            ((polarityOrBuffTypeIds ?? 0b11) & BuffPolarity.POSITIVE) != 0,
            ((polarityOrBuffTypeIds ?? 0b11) & BuffPolarity.NEGATIVE) != 0,
            ((resistanceType ?? 0b00) & BuffResistanceType.MAGIC) != 0,
            ((resistanceType ?? 0b00) & BuffResistanceType.PHYSICAL) != 0,
            includeExpirationTimers ?? true,
            includeAuras ?? true,
            autoDispel ?? false
        )
    }
    checkBuffs(this)
}
