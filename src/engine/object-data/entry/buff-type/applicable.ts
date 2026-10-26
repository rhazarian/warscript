import { AbilityType, AbilityTypeId } from "../ability-type"
import { CurseAbilityType } from "../ability-type/curse"
import { ThunderClapAbilityType } from "../ability-type/thunder-clap"
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
import { UnitAbility } from "../../../../core/types/ability"
import { Player } from "../../../../core/types/player"
import { Unit, UnitClassification } from "../../../internal/unit"
import { MAXIMUM_INTEGER } from "../../../../math"
import { chunked, map, max } from "../../../../utility/arrays"
import { BloodLustAbilityType } from "../ability-type/blood-lust"
import { BerserkAbilityType } from "../ability-type/berserk"
import { BlankUpgrade } from "../upgrade/blank"
import { UpgradeEffect, UpgradeEffectType, UpgradeId } from "../upgrade"
import { UnitType } from "../unit-type"
import { TupleOf } from "../../../../utility/types"
import { PermanentImmolationAbilityType } from "../ability-type/permanent-immolation"
import { castAbility } from "../../../internal/mechanics/cast-ability"

const setAbilityIntegerField = BlzSetAbilityIntegerField
const setAbilityRealLevelField = BlzSetAbilityRealLevelField
const setPlayerTechResearched = SetPlayerTechResearched
const unitAddAbility = UnitAddAbility
const unitRemoveAbility = UnitRemoveAbility

export type ApplicableBuffTypeId = BuffTypeId & { readonly __applicableBuffTypeId: unique symbol }

const compiletimeApplicableBuffTypes = new LuaSet<ApplicableBuffType>()

const enum ApplicatorType {
    HIDDEN = 0,
    PHYSICAL_POSITIVE = 852100, // berserk
    PHYSICAL_NEGATIVE = 852096, // thunderclap
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
        abilityType.casterEffectPresets = []
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

    const multilevelItemApplicatorAbilityTypes: AbilityType[] = []

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
                    ThunderClapAbilityType,
                    applicableBuffType,
                )
                applicatorAbilityType.isHeroAbility = false
                applicatorAbilityType.effectModelPaths = []
                applicatorAbilityType.areaEffectModelPaths = []
                applicatorAbilityType.damage = 0
                applicatorAbilityType.specificTargetDamage = 0
                applicatorAbilityType.maximumDamage = 0
                applicatorAbilityType.movementSpeedDecreaseFactor = 0
                applicatorAbilityType.attackSpeedDecreaseFactor = 0
                applicatorAbilityType.areaOfEffect = 1
                applicatorAbilityType.allowedTargetCombatClassifications = combatClassificationsOf(
                    CombatClassification.ANCIENT,
                    CombatClassification.GROUND,
                    CombatClassification.AIR,
                    CombatClassification.STRUCTURE,
                    CombatClassification.WARD,
                    CombatClassification.VULNERABLE,
                    CombatClassification.INVULNERABLE,
                )
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
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
                    multilevelItemApplicatorAbilityTypes[
                        multilevelItemApplicatorAbilityTypes.length
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

    for (const multilevelItemApplicatorAbilityTypesChunk of chunked(
        multilevelItemApplicatorAbilityTypes,
        4,
    )) {
        const maxLevelCount = max(map(multilevelItemApplicatorAbilityTypesChunk, "levelCount"))
        const applicatorAbilityTypeIds = map(multilevelItemApplicatorAbilityTypesChunk, "id")

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

/**
 * Makes the unit use the applicator ability from a dummy rune item on itself, which applies
 * the buff instantly. The ability level comes from the applicator upgrade researched for the
 * unit's owner for the duration of the cast.
 */
const castItemApplicatorAbility = (
    unit: Unit,
    applicatorAbilityTypeId: AbilityTypeId,
    prepareAbility: (
        ability: jability,
        level: number | undefined,
        duration: number,
        spellStealPriority: number | undefined,
    ) => void,
    level: number | undefined,
    duration: number,
    spellStealPriority: number | undefined,
): boolean => {
    const nativePlayer = unit.owner.handle
    let upgradeId: UpgradeId | undefined
    if (level != undefined && level > 0) {
        upgradeId = applicatorUpgradeIdByApplicatorAbilityTypeId.get(applicatorAbilityTypeId)
        if (upgradeId != undefined) {
            setPlayerTechResearched(nativePlayer, upgradeId, level)
        }
    }
    const success = castAbility(
        unit.handle,
        applicatorAbilityTypeId,
        prepareAbility,
        level,
        duration,
        spellStealPriority,
    )
    if (upgradeId != undefined) {
        setPlayerTechResearched(nativePlayer, upgradeId, 0)
    }
    return success
}

// Thunder Clap ignores the alliance part of its allowed targets: it only hits the caster's
// enemies, and never the caster itself.
const enemyOf = (player: Player): Player => {
    if (Player.neutralAggressive.isEnemyOf(player)) {
        return Player.neutralAggressive
    }
    for (const other of Player.all) {
        if (other.isEnemyOf(player)) {
            return other
        }
    }
    return Player.neutralAggressive
}

const ANCIENT_NEIGHBOR_SEARCH_RANGE = 64

/**
 * Physical negative buffs are applied by a Thunder Clap that an enemy dummy casts at the unit's
 * position: it is instant, unlike the missile and rune applicators, which land a frame later.
 * The applicator only hits ancients, so the unit is made an ancient for the cast and any other
 * ancient at that spot temporarily is not.
 *
 * @internal For use by internal systems only.
 */
export const castPhysicalNegativeApplicatorAbility = (
    unit: Unit,
    applicatorAbilityTypeId: number,
    prepareAbility: (ability: UnitAbility) => void,
): void => {
    const x = unit.x
    const y = unit.y
    const neighbors: Unit[] = []
    for (const neighbor of Unit.getInCollisionRange(x, y, ANCIENT_NEIGHBOR_SEARCH_RANGE)) {
        if (neighbor != unit && neighbor.hasClassification(UnitClassification.ANCIENT)) {
            neighbor.removeClassification(UnitClassification.ANCIENT)
            neighbors[neighbors.length] = neighbor
        }
    }
    const isAncientAdded =
        !unit.hasClassification(UnitClassification.ANCIENT) &&
        unit.addClassification(UnitClassification.ANCIENT)
    InstantDummyCaster.getInstance().cast(
        enemyOf(unit.owner),
        applicatorAbilityTypeId as AbilityTypeId,
        prepareAbility,
        x,
        y,
        ApplicatorType.PHYSICAL_NEGATIVE,
    )
    if (isAncientAdded) {
        unit.removeClassification(UnitClassification.ANCIENT)
    }
    for (const neighbor of neighbors) {
        neighbor.addClassification(UnitClassification.ANCIENT)
    }
}

/** @internal For use by internal systems only. */
export const internalApplyBuff = (
    unit: Unit,
    applicableBuffTypeId: ApplicableBuffTypeId,
    polarity: BuffPolarity,
    resistanceType: BuffResistanceType,
    level?: number,
    duration?: number,
    spellStealPriority?: number,
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
        return castItemApplicatorAbility(
            unit,
            applicatorAbilityTypeId,
            preparePhysicalPositiveApplicatorAbility,
            level,
            duration ?? 0,
            spellStealPriority,
        )
    }

    const prepareAbility = (ability: UnitAbility): void => {
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
        if (missProbability !== undefined && applicatorType == ApplicatorType.MAGIC_NEGATIVE) {
            ability.setField(ABILITY_RLF_CHANCE_TO_MISS_CRS, missProbability)
        }
    }

    if (applicatorType == ApplicatorType.PHYSICAL_NEGATIVE) {
        castPhysicalNegativeApplicatorAbility(unit, applicatorAbilityTypeId, prepareAbility)
        return true
    }

    return InstantDummyCaster.getInstance().castTarget(
        unit.owner,
        applicatorAbilityTypeId,
        prepareAbility,
        applicatorType,
        unit,
    )
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

/**
 * Removes the ability that keeps a hidden buff on the unit. A leftover applicator
 * makes the next hidden application fail, since the unit already has the ability.
 *
 * @internal For use by internal systems only.
 */
export const removeBuffApplicator = (unit: junit, applicableBuffTypeId: number): void => {
    const applicatorAbilityTypeId = applicatorAbilityTypeIdByApplicatorTypeByApplicableBuffTypeId
        .get(applicableBuffTypeId as ApplicableBuffTypeId)
        ?.get(ApplicatorType.HIDDEN)
    if (applicatorAbilityTypeId != undefined) {
        unitRemoveAbility(unit, applicatorAbilityTypeId)
    }
}

/** @internal For use by internal systems only. */
export const removeBuff = (unit: junit, applicableBuffTypeId: number): boolean => {
    removeBuffApplicator(unit, applicableBuffTypeId)
    return unitRemoveAbility(unit, applicableBuffTypeId)
}
