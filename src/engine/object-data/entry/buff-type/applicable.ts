import { AbilityType, AbilityTypeId } from "../ability-type"
import { CrippleAbilityType } from "../ability-type/cripple"
import { SearingArrowsAbilityType } from "../ability-type/searing-arrows"
import { SlowPoisonAbilityType } from "../ability-type/slow-poison"
import { BuffPolarity } from "../../auxiliary/buff-polarity"
import { BuffResistanceType } from "../../auxiliary/buff-resistance-type"
import {
    CombatClassification,
    combatClassificationsOf,
} from "../../auxiliary/combat-classification"
import { Race } from "../../auxiliary/race"
import { SoundPresetName } from "../../auxiliary/sound-preset-name"
import { BuffType, BuffTypeId } from "../buff-type"
import { ObjectDataEntryConstructor } from "../../entry"

import { InstantDummyCaster } from "../../../../core/dummy"
import { Unit } from "../../../internal/unit"
import { MAXIMUM_INTEGER } from "../../../../math"
import { chunked, map, max, toLuaSet } from "../../../../utility/arrays"
import { BloodLustAbilityType } from "../ability-type/blood-lust"
import { BerserkAbilityType } from "../ability-type/berserk"
import { DUMMY_ITEM_ID } from "../../../internal/object-data/dummy-item"
import { INVENTORY_ABILITY_TYPE_ID } from "../../../internal/object-data/dummy-inventory"
import { BlankUpgrade } from "../upgrade/blank"
import { UpgradeEffect, UpgradeEffectType, UpgradeId } from "../upgrade"
import { INVENTORY_DUMMY_NATIVE_UNIT } from "../../../internal/misc/dummy-units"
import { checkNotNull } from "../../../../utility/preconditions"
import { UnitType } from "../unit-type"
import { TupleOf } from "../../../../utility/types"
import { EventListenerPriority } from "../../../../event"
import { PermanentImmolationAbilityType } from "../ability-type/permanent-immolation"

const createItem = CreateItem
const getAbilityId = BlzGetAbilityId
const getItemAbility = BlzGetItemAbility
const getOwningPlayer = GetOwningPlayer
const getUnitAbilityByIndex = BlzGetUnitAbilityByIndex
const itemAddAbility = BlzItemAddAbility
const removeItem = RemoveItem
const setAbilityIntegerField = BlzSetAbilityIntegerField
const setAbilityRealLevelField = BlzSetAbilityRealLevelField
const setItemBooleanField = BlzSetItemBooleanField
const setPlayerTechResearched = SetPlayerTechResearched
const unitAddAbility = UnitAddAbility
const unitAddItem = UnitAddItem
const unitDisableAbility = BlzUnitDisableAbility
const unitDropItemSlot = UnitDropItemSlot
const unitInventorySize = UnitInventorySize
const unitRemoveAbility = UnitRemoveAbility

export type ApplicableBuffTypeId = BuffTypeId & { readonly __applicableBuffTypeId: unique symbol }

const compiletimeApplicableBuffTypes = new LuaSet<ApplicableBuffType>()

const enum ApplicatorType {
    HIDDEN = 0,
    PHYSICAL_POSITIVE = 852100, // berserk
    PHYSICAL_NEGATIVE = 852173, // flamingarrowstarg
    MAGIC_POSITIVE = 852101, // bloodlust
    MAGIC_NEGATIVE = 852189, // cripple
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
        applicableBuffType: ApplicableBuffType
    ): T => {
        const abilityType = abilityTypeConstructor.create()
        abilityType.isInternal = true
        abilityType.levelCount = applicableBuffType.levelCount
        abilityType.buttonPositionX = 0
        abilityType.buttonPositionY = -11
        abilityType.casterAttachmentPresets = []
        abilityType.targetEffectPresets = []
        abilityType.soundPresetName = SoundPresetName.NONE
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
            CombatClassification.WARD
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
                    CrippleAbilityType,
                    applicableBuffType
                )
                applicatorAbilityType.movementSpeedDecreaseFactor = 0
                applicatorAbilityType.attackSpeedDecreaseFactor = 0
                applicatorAbilityType.damageDecreaseFactor = 0
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
                applicatorAbilityTypeIdByApplicatorType.set(
                    ApplicatorType.MAGIC_NEGATIVE,
                    applicatorAbilityType.id
                )
            }
            if (
                applicableBuffType.polarity == BuffPolarity.POSITIVE ||
                applicableBuffType.polarity == undefined
            ) {
                const applicatorAbilityType = prepareAbilityType(
                    BloodLustAbilityType,
                    applicableBuffType
                )
                applicatorAbilityType.attackSpeedIncreaseFactor = 0
                applicatorAbilityType.movementSpeedIncreaseFactor = 0
                applicatorAbilityType.scaleIncrease = 0
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
                applicatorAbilityTypeIdByApplicatorType.set(
                    ApplicatorType.MAGIC_POSITIVE,
                    applicatorAbilityType.id
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
                    applicableBuffType
                )
                applicatorAbilityType.damagePerSecond = 0
                applicatorAbilityType.movementSpeedDecreaseFactor = 0
                applicatorAbilityType.attackSpeedDecreaseFactor = 0
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id, applicableBuffType.id]
                applicatorAbilityTypeIdByApplicatorType.set(
                    ApplicatorType.PHYSICAL_NEGATIVE,
                    applicatorAbilityType.id
                )
            }
            if (
                applicableBuffType.polarity == BuffPolarity.POSITIVE ||
                applicableBuffType.polarity == undefined
            ) {
                const applicatorAbilityType = prepareAbilityType(
                    BerserkAbilityType,
                    applicableBuffType
                )
                applicatorAbilityType.attackSpeedIncreaseFactor = 0
                applicatorAbilityType.movementSpeedIncreaseFactor = 0
                applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
                if (applicatorAbilityType.levelCount > 1) {
                    multilevelPhysicalPositiveApplicatorAbilityTypes[
                        multilevelPhysicalPositiveApplicatorAbilityTypes.length
                    ] = applicatorAbilityType
                }
                applicatorAbilityTypeIdByApplicatorType.set(
                    ApplicatorType.PHYSICAL_POSITIVE,
                    applicatorAbilityType.id
                )
            }
        }
        if (
            applicableBuffType.polarity == BuffPolarity.HIDDEN ||
            applicableBuffType.polarity == undefined
        ) {
            const applicatorAbilityType = prepareAbilityType(
                PermanentImmolationAbilityType,
                applicableBuffType
            )
            applicatorAbilityType.levelCount = 1
            applicatorAbilityType.damagePerInterval = 0
            applicatorAbilityType.castRange = 0
            applicatorAbilityType.buffDuration = MAXIMUM_INTEGER
            applicatorAbilityType.heroBuffDuration = MAXIMUM_INTEGER
            applicatorAbilityType.allowedTargetCombatClassifications = combatClassificationsOf(
                CombatClassification.NONE
            )
            applicatorAbilityType.buffTypeIds = [applicableBuffType.id]
            applicatorAbilityTypeIdByApplicatorType.set(
                ApplicatorType.HIDDEN,
                applicatorAbilityType.id
            )
        }
        applicatorAbilityTypeIdByApplicatorTypeByApplicableBuffTypeId.set(
            applicableBuffType.id,
            applicatorAbilityTypeIdByApplicatorType
        )
    }

    const applicatorUpgradeIds: UpgradeId[] = []
    const applicatorUpgradeIdByApplicatorAbilityTypeId = new LuaMap<AbilityTypeId, UpgradeId>()

    for (const multilevelPhysicalPositiveApplicatorAbilityTypesChunk of chunked(
        multilevelPhysicalPositiveApplicatorAbilityTypes,
        4
    )) {
        const maxLevelCount = max(
            map(multilevelPhysicalPositiveApplicatorAbilityTypesChunk, "levelCount")
        )
        const applicatorAbilityTypeIds = map(
            multilevelPhysicalPositiveApplicatorAbilityTypesChunk,
            "id"
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
                applicatorUpgrade.id
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
        map(["AEev", "ACes", "ACev", "AIes", "ANdb", "Acdb", "AOcr", "ACct", "AIcs"], fourCC)
    )
})

const INVENTORY_ABILITY_TYPE_IDS = postcompile(() => {
    return toLuaSet(
        AbilityType.getAllIdsByBaseIds(map(["AInv", "Aihn", "Aien", "Aion", "Aiun"], fourCC))
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
        CombatClassification.INVULNERABLE
    )
    return abilityType.id
})

Unit.abilityCastingStartEvent[SEARING_ARROWS_DUMMY_ABILITY_TYPE_ID].addListener(
    EventListenerPriority.HIGHEST,
    (unit) => {
        unit.removeAbility(SEARING_ARROWS_DUMMY_ABILITY_TYPE_ID)
    }
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
    movementSpeedIncreaseFactor?: number
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
        let success: boolean
        const nativeUnit = unit.handle
        const nativeItem = createItem(DUMMY_ITEM_ID, 0, 0)
        unitAddItem(INVENTORY_DUMMY_NATIVE_UNIT, nativeItem)
        itemAddAbility(nativeItem, applicatorAbilityTypeId)
        const applicatorAbility = checkNotNull(getItemAbility(nativeItem, applicatorAbilityTypeId))
        if (level == undefined) {
            level = 0
            setAbilityIntegerField(applicatorAbility, ABILITY_IF_LEVELS, 1)
        }
        setAbilityRealLevelField(
            applicatorAbility,
            ABILITY_RLF_DURATION_NORMAL,
            level,
            duration ?? 0
        )
        setAbilityRealLevelField(applicatorAbility, ABILITY_RLF_DURATION_HERO, level, duration ?? 0)
        if (movementSpeedIncreaseFactor != undefined) {
            setAbilityRealLevelField(
                applicatorAbility,
                ABILITY_RLF_MOVEMENT_SPEED_INCREASE_BSK1,
                level,
                movementSpeedIncreaseFactor
            )
        }
        setItemBooleanField(nativeItem, ITEM_BF_ACTIVELY_USED, true)
        setItemBooleanField(nativeItem, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, true)
        if (level > 0) {
            const upgradeId =
                applicatorUpgradeIdByApplicatorAbilityTypeId.get(applicatorAbilityTypeId)
            if (upgradeId != undefined) {
                setPlayerTechResearched(getOwningPlayer(nativeUnit), upgradeId, level)
            }
        }
        if (!unitAddItem(nativeUnit, nativeItem)) {
            let latestInventoryAbilityTypeId = 0
            const nativeItemBySlot = new LuaMap<number, jitem>()
            const inventorySize = unitInventorySize(nativeUnit)
            if (inventorySize != 0) {
                for (const slot of $range(0, inventorySize - 1)) {
                    nativeItemBySlot.set(slot, UnitRemoveItemFromSlot(nativeUnit, slot))
                }
                let unitNativeAbility = getUnitAbilityByIndex(nativeUnit, 0)
                let i = 1
                while (unitNativeAbility != undefined) {
                    const abilityTypeId = getAbilityId(unitNativeAbility) as AbilityTypeId
                    if (INVENTORY_ABILITY_TYPE_IDS.has(abilityTypeId)) {
                        latestInventoryAbilityTypeId = abilityTypeId
                    }
                    unitNativeAbility = getUnitAbilityByIndex(nativeUnit, i)
                    ++i
                }
                unitRemoveAbility(nativeUnit, latestInventoryAbilityTypeId)
            }
            unitAddAbility(nativeUnit, INVENTORY_ABILITY_TYPE_ID)
            success = unitAddItem(nativeUnit, nativeItem)
            unitRemoveAbility(nativeUnit, INVENTORY_ABILITY_TYPE_ID)
            if (latestInventoryAbilityTypeId != 0) {
                unitAddAbility(nativeUnit, latestInventoryAbilityTypeId)
                for (const [slot, nativeItem] of nativeItemBySlot) {
                    unitAddItem(nativeUnit, nativeItem)
                    unitDropItemSlot(nativeUnit, nativeItem, slot)
                }
            }
        } else {
            success = true
        }
        removeItem(nativeItem)
        if (level != undefined && level > 1) {
            const upgradeId =
                applicatorUpgradeIdByApplicatorAbilityTypeId.get(applicatorAbilityTypeId)
            if (upgradeId != undefined) {
                setPlayerTechResearched(getOwningPlayer(nativeUnit), upgradeId, 0)
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
        },
        applicatorType,
        unit
    )
    if (applicatorType == ApplicatorType.PHYSICAL_NEGATIVE) {
        for (const abilityId of EVASION_ABILITY_TYPE_IDS) {
            unitDisableAbility(unit.handle, abilityId, false, false)
        }
    }

    return success
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
