import { AbilityType, AbilityTypeId } from "../ability-type"
import { CurseAbilityType } from "../ability-type/curse"
import { SearingArrowsAbilityType } from "../ability-type/searing-arrows"
import { SlowPoisonAbilityType } from "../ability-type/slow-poison"
import { BuffPolarity } from "../../auxiliary/buff-polarity"
import { BuffResistanceType } from "../../auxiliary/buff-resistance-type"
import {
    CombatClassification,
    combatClassificationsOf,
} from "../../auxiliary/combat-classification"
import { Race } from "../../auxiliary/race"
import { BuffType, BuffTypeId } from "../buff-type"
import { ObjectDataEntryConstructor } from "../../entry"

import { InstantDummyCaster } from "../../../../core/dummy"
import { Unit } from "../../../internal/unit"
import { MAXIMUM_INTEGER } from "../../../../math"
import { chunked, map, max } from "../../../../utility/arrays"
import { BloodLustAbilityType } from "../ability-type/blood-lust"
import { BerserkAbilityType } from "../ability-type/berserk"
import { BlankUpgrade } from "../upgrade/blank"
import { UpgradeEffect, UpgradeEffectType, UpgradeId } from "../upgrade"
import { UnitType } from "../unit-type"
import { TupleOf } from "../../../../utility/types"
import { EventListenerPriority } from "../../../../event"
import { PermanentImmolationAbilityType } from "../ability-type/permanent-immolation"
import { castAbility } from "../../../internal/mechanics/cast-ability"

const setAbilityIntegerField = BlzSetAbilityIntegerField
const setAbilityRealLevelField = BlzSetAbilityRealLevelField
const setPlayerTechResearched = SetPlayerTechResearched
const unitAddAbility = UnitAddAbility
const unitDisableAbility = BlzUnitDisableAbility
const unitRemoveAbility = UnitRemoveAbility

export type ApplicableBuffTypeId = BuffTypeId & { readonly __applicableBuffTypeId: unique symbol }

const compiletimeApplicableBuffTypes = new LuaSet<ApplicableBuffType>()

const enum ApplicatorType {
    HIDDEN = 0,
    PHYSICAL_POSITIVE = 852100, // berserk
    PHYSICAL_NEGATIVE = 852173, // flamingarrowstarg
    MAGIC_POSITIVE = 852101, // bloodlust
    MAGIC_NEGATIVE = 852190, // curse
}

export class ApplicableBuffType extends BuffType<ApplicableBuffTypeId> {
    public static override readonly BASE_ID = fourCC("BHbz") as BuffTypeId

    public levelCount = 4
    public resistanceType?: Exclude<BuffResistanceType, BuffResistanceType.BOTH>
    public polarity?: BuffPolarity

    public constructor(object: WarObject) {
        super(object)
        compiletimeApplicableBuffTypes.add(this)
    }

    public static wrap(other: BuffType): ApplicableBuffType {
        if (other instanceof ApplicableBuffType) {
            return other
        }
        return new ApplicableBuffType(other["object"])
    }
}

const [
    applicatorAbilityTypeIdByApplicatorTypeByApplicableBuffTypeId,
    applicatorUpgradeIdByApplicatorAbilityTypeId,
] = postcompile(() => {
    const prepareAbilityType = <T extends AbilityType>(
        abilityTypeConstructor: ObjectDataEntryConstructor<T>,
        applicableBuffType: ApplicableBuffType,
    ): T => {
        const abilityType = abilityTypeConstructor.create()
        abilityType.isInternal = true
        abilityType.levelCount = applicableBuffType.levelCount
        abilityType.buttonPositionX = 0
        abilityType.buttonPositionY = -11
        abilityType.casterAttachmentPresets = []
        abilityType.targetEffectPresets = []
        abilityType.casterEffectSoundPresetId = undefined
        abilityType.learnLevelMinimum = 6
        abilityType.race = Race.OTHER
        abilityType.shouldCheckTechTreeDependencies = false
        abilityType.techTreeDependencies = []
        abilityType.allowedTargetCombatClassifications = combatClassificationsOf(
            CombatClassification.AIR,
            CombatClassification.GROUND,
            CombatClassification.INVULNERABLE,
            CombatClassification.STRUCTURE,
            CombatClassification.VULNERABLE,
            CombatClassification.WARD,
        )
        abilityType.areaOfEffect = 0
        abilityType.castRange = 999999
        abilityType.cooldown = 0
        abilityType.manaCost = 0
        abilityType.buffDuration = 0
        abilityType.heroBuffDuration = 0
        return abilityType
    }

    const multilevelPhysicalPositiveApplicatorAbilityTypes: AbilityType[] = []

    const applicatorAbilityTypeIdByApplicatorTypeByApplicableBuffTypeId = new LuaMap<
        ApplicableBuffTypeId,
        LuaMap<ApplicatorType, AbilityTypeId>
    >()

    for (const applicableBuffType of compiletimeApplicableBuffTypes) {
        const applicatorAbilityTypeIdByApplicatorType = new LuaMap<ApplicatorType, AbilityTypeId>()
        if (
            applicableBuffType.resistanceType == BuffResistanceType.MAGIC ||
            applicableBuffType.resistanceType == undefined
        ) {
            if (
                applicableBuffType.polarity == BuffPolarity.NEGATIVE ||
                applicableBuffType.polarity == undefined
            ) {
                const applicatorAbilityType = prepareAbilityType(
                    CurseAbilityType,
                    applicableBuffType,
                )
                applicatorAbilityType.missProbability = 0
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
                applicatorAbilityTypeIdByApplicatorType.set(
                    ApplicatorType.MAGIC_NEGATIVE,
                    applicatorAbilityType.id,
                )
            }
            if (
                applicableBuffType.polarity == BuffPolarity.POSITIVE ||
                applicableBuffType.polarity == undefined
            ) {
                const applicatorAbilityType = prepareAbilityType(
                    BloodLustAbilityType,
                    applicableBuffType,
                )
                applicatorAbilityType.attackSpeedIncreaseFactor = 0
                applicatorAbilityType.movementSpeedIncreaseFactor = 0
                applicatorAbilityType.scaleIncrease = 0
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
                applicatorAbilityTypeIdByApplicatorType.set(
                    ApplicatorType.MAGIC_POSITIVE,
                    applicatorAbilityType.id,
                )
            }
        }
        if (
            applicableBuffType.resistanceType == BuffResistanceType.PHYSICAL ||
            applicableBuffType.resistanceType == undefined
        ) {
            if (
                applicableBuffType.polarity == BuffPolarity.NEGATIVE ||
                applicableBuffType.polarity == undefined
            ) {
                const applicatorAbilityType = prepareAbilityType(
                    SlowPoisonAbilityType,
                    applicableBuffType,
                )
                applicatorAbilityType.damagePerSecond = 0
                applicatorAbilityType.movementSpeedDecreaseFactor = 0
                applicatorAbilityType.attackSpeedDecreaseFactor = 0
                applicatorAbilityType.isDamageStacking = false
                applicatorAbilityType.isMovementSpeedFactorStacking = false
                applicatorAbilityType.isAttackSpeedFactorStacking = false
                applicatorAbilityType.isAbleToKill = false
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id, applicableBuffType.id]
                applicatorAbilityTypeIdByApplicatorType.set(
                    ApplicatorType.PHYSICAL_NEGATIVE,
                    applicatorAbilityType.id,
                )
            }
            if (
                applicableBuffType.polarity == BuffPolarity.POSITIVE ||
                applicableBuffType.polarity == undefined
            ) {
                const applicatorAbilityType = prepareAbilityType(
                    BerserkAbilityType,
                    applicableBuffType,
                )
                applicatorAbilityType.attackSpeedIncreaseFactor = 0
                applicatorAbilityType.movementSpeedIncreaseFactor = 0
                applicatorAbilityType.receivedDamageIncreaseFactor = 0
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
                if (applicatorAbilityType.levelCount > 1) {
                    multilevelPhysicalPositiveApplicatorAbilityTypes[
                        multilevelPhysicalPositiveApplicatorAbilityTypes.length
                    ] = applicatorAbilityType
                }
                applicatorAbilityTypeIdByApplicatorType.set(
                    ApplicatorType.PHYSICAL_POSITIVE,
                    applicatorAbilityType.id,
                )
            }
        }
        if (
            applicableBuffType.polarity == BuffPolarity.HIDDEN ||
            applicableBuffType.polarity == undefined
        ) {
            const applicatorAbilityType = prepareAbilityType(
                PermanentImmolationAbilityType,
                applicableBuffType,
            )
            applicatorAbilityType.levelCount = 1
            applicatorAbilityType.damagePerInterval = 0
            applicatorAbilityType.castRange = 0
            applicatorAbilityType.buffDuration = MAXIMUM_INTEGER
            applicatorAbilityType.heroBuffDuration = MAXIMUM_INTEGER
            applicatorAbilityType.allowedTargetCombatClassifications = combatClassificationsOf(
                CombatClassification.NONE,
            )
            applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
            applicatorAbilityTypeIdByApplicatorType.set(
                ApplicatorType.HIDDEN,
                applicatorAbilityType.id,
            )
        }
        applicatorAbilityTypeIdByApplicatorTypeByApplicableBuffTypeId.set(
            applicableBuffType.id,
            applicatorAbilityTypeIdByApplicatorType,
        )
    }

    const applicatorUpgradeIds: UpgradeId[] = []
    const applicatorUpgradeIdByApplicatorAbilityTypeId = new LuaMap<AbilityTypeId, UpgradeId>()

    for (const multilevelPhysicalPositiveApplicatorAbilityTypesChunk of chunked(
        multilevelPhysicalPositiveApplicatorAbilityTypes,
        4,
    )) {
        const maxLevelCount = max(
            map(multilevelPhysicalPositiveApplicatorAbilityTypesChunk, "levelCount"),
        )
        const applicatorAbilityTypeIds = map(
            multilevelPhysicalPositiveApplicatorAbilityTypesChunk,
            "id",
        )

        const applicatorUpgrade = BlankUpgrade.create()
        applicatorUpgrade.isInternal = true
        applicatorUpgrade.levelCount = maxLevelCount - 1
        applicatorUpgrade.effects = map(applicatorAbilityTypeIds, (applicatorAbilityTypeId) => {
            return {
                type: UpgradeEffectType.ABILITY_LEVEL_BONUS,
                bonusBase: 1,
                bonusIncrement: 1,
                abilityTypeId: applicatorAbilityTypeId,
            }
        }) as TupleOf<UpgradeEffect, 1 | 2 | 3 | 4>
        applicatorUpgradeIds[applicatorUpgradeIds.length] = applicatorUpgrade.id

        for (const applicatorAbilityTypeId of applicatorAbilityTypeIds) {
            applicatorUpgradeIdByApplicatorAbilityTypeId.set(
                applicatorAbilityTypeId,
                applicatorUpgrade.id,
            )
        }
    }

    for (const unitType of UnitType.getAll()) {
        unitType.affectingUpgradeIds = [...unitType.affectingUpgradeIds, ...applicatorUpgradeIds]
    }

    return [
        applicatorAbilityTypeIdByApplicatorTypeByApplicableBuffTypeId,
        applicatorUpgradeIdByApplicatorAbilityTypeId,
    ]
})

const EVASION_ABILITY_TYPE_IDS = postcompile(() => {
    return AbilityType.getAllIdsByBaseIds(
        map(["AEev", "ACes", "ACev", "AIes", "ANdb", "Acdb", "AOcr", "ACct", "AIcs"], fourCC),
    )
})

const SEARING_ARROWS_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = SearingArrowsAbilityType.create()
    abilityType.isInternal = true
    abilityType.levelCount = 1
    abilityType.missileModelPath = ""
    abilityType.race = Race.OTHER
    abilityType.learnLevelMinimum = 6
    abilityType.shouldCheckTechTreeDependencies = false
    abilityType.techTreeDependencies = []
    abilityType.damageIncrease = 0
    abilityType.castRange = 99999
    abilityType.manaCost = 0
    abilityType.cooldown = 0
    abilityType.allowedTargetCombatClassifications = combatClassificationsOf(
        CombatClassification.GROUND,
        CombatClassification.AIR,
        CombatClassification.STRUCTURE,
        CombatClassification.WARD,
        CombatClassification.VULNERABLE,
        CombatClassification.INVULNERABLE,
    )
    return abilityType.id
})

Unit.abilityCastingStartEvent[SEARING_ARROWS_DUMMY_ABILITY_TYPE_ID].addListener(
    EventListenerPriority.HIGHEST,
    (unit) => {
        unit.removeAbility(SEARING_ARROWS_DUMMY_ABILITY_TYPE_ID)
    },
)

/** @internal For use by internal systems only. */
export const internalApplyBuff = (
    unit: Unit,
    applicableBuffTypeId: ApplicableBuffTypeId,
    polarity: BuffPolarity,
    resistanceType: BuffResistanceType,
    level?: number,
    duration?: number,
    spellStealPriority?: number,
    learnLevelMinimum?: number,
    missProbability?: number,
): boolean => {
    const applicatorType =
        polarity == BuffPolarity.POSITIVE
            ? resistanceType == BuffResistanceType.MAGIC
                ? ApplicatorType.MAGIC_POSITIVE
                : ApplicatorType.PHYSICAL_POSITIVE
            : polarity == BuffPolarity.NEGATIVE
              ? resistanceType == BuffResistanceType.MAGIC
                  ? ApplicatorType.MAGIC_NEGATIVE
                  : ApplicatorType.PHYSICAL_NEGATIVE
              : ApplicatorType.HIDDEN
    const applicatorAbilityTypeId = applicatorAbilityTypeIdByApplicatorTypeByApplicableBuffTypeId
        .get(applicableBuffTypeId)
        ?.get(applicatorType)
    if (applicatorAbilityTypeId == undefined) {
        return false
    }

    if (applicatorType == ApplicatorType.HIDDEN) {
        return unitAddAbility(unit.handle, applicatorAbilityTypeId)
    }

    if (applicatorType == ApplicatorType.PHYSICAL_POSITIVE) {
        const nativePlayer = unit.owner.handle
        if (level != undefined && level > 0) {
            const upgradeId =
                applicatorUpgradeIdByApplicatorAbilityTypeId.get(applicatorAbilityTypeId)
            if (upgradeId != undefined) {
                setPlayerTechResearched(nativePlayer, upgradeId, level)
            }
        }
        const success = castAbility(
            unit.handle,
            applicatorAbilityTypeId,
            preparePhysicalPositiveApplicatorAbility,
            level,
            duration ?? 0,
        )
        if (level != undefined && level > 0) {
            const upgradeId =
                applicatorUpgradeIdByApplicatorAbilityTypeId.get(applicatorAbilityTypeId)
            if (upgradeId != undefined) {
                setPlayerTechResearched(nativePlayer, upgradeId, 0)
            }
        }
        return success
    }

    if (applicatorType == ApplicatorType.PHYSICAL_NEGATIVE) {
        for (const abilityId of EVASION_ABILITY_TYPE_IDS) {
            unitDisableAbility(unit.handle, abilityId, true, false)
        }
    }
    const success = InstantDummyCaster.getInstance().castTarget(
        unit.owner,
        [applicatorAbilityTypeId, SEARING_ARROWS_DUMMY_ABILITY_TYPE_ID],
        (ability) => {
            if (level == undefined) {
                ability.setField(ABILITY_IF_LEVELS, 1)
                level = 0
            }
            ability.level = level
            duration = duration ?? 0
            const actualDuration = duration > 0 ? duration : MAXIMUM_INTEGER
            ability.setField(ABILITY_RLF_DURATION_NORMAL, level, actualDuration)
            ability.setField(ABILITY_RLF_DURATION_HERO, level, actualDuration)
            ability.setField(ABILITY_IF_PRIORITY, spellStealPriority ?? 0)
            ability.setField(ABILITY_IF_REQUIRED_LEVEL, learnLevelMinimum ?? 6)
            if (missProbability !== undefined && applicatorType == ApplicatorType.MAGIC_NEGATIVE) {
                ability.setField(ABILITY_RLF_CHANCE_TO_MISS_CRS, missProbability)
            }
        },
        applicatorType,
        unit,
    )
    if (applicatorType == ApplicatorType.PHYSICAL_NEGATIVE) {
        for (const abilityId of EVASION_ABILITY_TYPE_IDS) {
            unitDisableAbility(unit.handle, abilityId, false, false)
        }
    }

    return success
}

const preparePhysicalPositiveApplicatorAbility = (
    ability: jability,
    level: number | undefined,
    duration: number,
): void => {
    if (level == undefined) {
        setAbilityIntegerField(ability, ABILITY_IF_LEVELS, 1)
        level = 1
    }
    setAbilityRealLevelField(ability, ABILITY_RLF_DURATION_NORMAL, level, duration)
    setAbilityRealLevelField(ability, ABILITY_RLF_DURATION_HERO, level, duration)
}

/** @internal For use by internal systems only. */
export const removeBuff = (unit: junit, applicableBuffTypeId: number): boolean => {
    const applicatorAbilityTypeId = applicatorAbilityTypeIdByApplicatorTypeByApplicableBuffTypeId
        .get(applicableBuffTypeId as ApplicableBuffTypeId)
        ?.get(ApplicatorType.HIDDEN)
    if (applicatorAbilityTypeId != undefined) {
        unitRemoveAbility(unit, applicatorAbilityTypeId)
    }
    return unitRemoveAbility(unit, applicableBuffTypeId)
}
