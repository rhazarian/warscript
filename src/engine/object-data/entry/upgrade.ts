import { map, mapIndexed } from "../../../utility/arrays"
import { TupleOf } from "../../../utility/types"

import {
    extractTechTreeDependencyInputLevel,
    extractTechTreeDependencyInputObjectDataEntryId,
    TechTreeDependency,
    TechTreeDependencyInput,
} from "../auxiliary/tech-tree-dependency"
import {
    extractObjectDataEntryLevelArrayFieldValue,
    ObjectDataEntry,
    ObjectDataEntryId,
    ObjectDataEntryLevelFieldValueSupplier,
} from "../entry"
import { ObjectDataEntryIdGenerator } from "../utility/object-data-entry-id-generator"

import { AbilityTypeId } from "./ability-type"
import type { UnitTypeId } from "./unit-type"

export type UpgradeId = ObjectDataEntryId & { readonly __upgradeId: unique symbol }

export const enum UpgradeEffectType {
    ABILITY_LEVEL_BONUS = "rlev",
    ADD_ULTRAVISION = "rauv",
    APPLY_AUTO_ATTACK_UPGRADE_BONUS = "ratt",
    APPLY_ARMOR_UPGRADE_BONUS = "rarm",
    AUTO_ATTACK_TARGET_COUNT_BONUS = "ratc",
}

export type UpgradeEffect =
    | {
          type:
              | UpgradeEffectType.ADD_ULTRAVISION
              | UpgradeEffectType.APPLY_AUTO_ATTACK_UPGRADE_BONUS
              | UpgradeEffectType.APPLY_ARMOR_UPGRADE_BONUS
          bonusBase: undefined
          bonusIncrement: undefined
          abilityTypeId: undefined
      }
    | {
          type: UpgradeEffectType.ABILITY_LEVEL_BONUS
          bonusBase: number
          bonusIncrement: number
          abilityTypeId: AbilityTypeId
      }
    | {
          type: UpgradeEffectType.AUTO_ATTACK_TARGET_COUNT_BONUS
          bonusBase: number
          bonusIncrement: number
          abilityTypeId: undefined
      }

export abstract class Upgrade extends ObjectDataEntry<UpgradeId> {
    private static readonly idGenerator = new ObjectDataEntryIdGenerator(fourCC("R000"))

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.upgrade
    }

    // Art

    public get buttonPositionX(): number {
        return this.getNumberField("gbpx")
    }

    public set buttonPositionX(buttonPositionX: number) {
        this.setNumberField("gbpx", buttonPositionX)
    }

    public get buttonPositionY(): number {
        return this.getNumberField("gbpy")
    }

    public set buttonPositionY(buttonPositionY: number) {
        this.setNumberField("gbpy", buttonPositionY)
    }

    public get iconPath(): string[] {
        return this.getStringLevelField("gar1")
    }

    public set iconPath(iconPath: ObjectDataEntryLevelFieldValueSupplier<string>) {
        this.setStringLevelField("gar1", iconPath)
    }

    // Data

    public get effects(): TupleOf<UpgradeEffect, 0 | 1 | 2 | 3 | 4> {
        const effects: UpgradeEffect[] = []
        for (const i of $range(1, 4)) {
            const effect = this.getEffect(i)
            if (effect != undefined) {
                effects[effects.length] = effect
            }
        }
        return effects as TupleOf<UpgradeEffect, 0 | 1 | 2 | 3 | 4>
    }

    public set effects(effects: TupleOf<UpgradeEffect, 0 | 1 | 2 | 3 | 4>) {
        for (const i of $range(1, 4)) {
            this.setEffect(i, effects[i - 1])
        }
    }

    // Stats

    public get levelCount(): number {
        return this.getNumberField("glvl")
    }

    public set levelCount(levelCount: number) {
        this.setNumberField("glvl", levelCount)
    }

    // Tech Tree

    public get techTreeDependencies(): TechTreeDependency[][] {
        const techTreeDependencyIds = this.getObjectDataEntryIdsLevelField("greq")
        const techTreeDependencyInternalLevels = this.getNumbersLevelField("grqc")
        return mapIndexed(techTreeDependencyIds, (level, levelTechTreeDependencyIds) => {
            const levelTechTreeDependencyInternalLevels =
                techTreeDependencyInternalLevels[level] ?? []
            return mapIndexed(levelTechTreeDependencyIds, (index, levelTechTreeDependencyId) => {
                const levelTechTreeDependencyInternalLevel =
                    levelTechTreeDependencyInternalLevels[index] ?? 1
                if (Upgrade.getAllIdsByBaseIds(levelTechTreeDependencyId).length != 0) {
                    return {
                        upgradeId: levelTechTreeDependencyId as UpgradeId,
                        level: levelTechTreeDependencyInternalLevel - 1,
                    } as TechTreeDependency
                } else {
                    return {
                        unitTypeId: levelTechTreeDependencyId as UnitTypeId,
                    } as TechTreeDependency
                }
            })
        })
    }

    public set techTreeDependencies(
        techTreeDependencies: ObjectDataEntryLevelFieldValueSupplier<TechTreeDependencyInput[]>
    ) {
        const currentTechTreeDependencies = this.techTreeDependencies
        const techTreeDependencyIds: ObjectDataEntryId[][] = []
        const techTreeDependencyInternalLevels: number[][] = []
        for (const level of $range(0, this.levelCount - 1)) {
            const levelTechTreeDependencies = extractObjectDataEntryLevelArrayFieldValue(
                techTreeDependencies,
                level,
                currentTechTreeDependencies[level]
            )
            techTreeDependencyIds[level] = map(
                levelTechTreeDependencies,
                extractTechTreeDependencyInputObjectDataEntryId
            )
            techTreeDependencyInternalLevels[level] = map(
                map(levelTechTreeDependencies, extractTechTreeDependencyInputLevel),
                (level) => level + 1
            )
        }
        this.setObjectDataEntryIdsLevelField("greq", techTreeDependencyIds)
        this.setNumbersLevelField("grqc", techTreeDependencyInternalLevels)
    }

    // Text

    public get hotkey(): string[] {
        return this.getStringLevelField("ghk1")
    }

    public set hotkey(hotkey: ObjectDataEntryLevelFieldValueSupplier<string>) {
        this.setStringLevelField("ghk1", hotkey)
    }

    public get name(): string[] {
        return this.getStringLevelField("gnam")
    }

    public set name(name: ObjectDataEntryLevelFieldValueSupplier<string>) {
        this.setStringLevelField("gnam", name)
    }

    public get tooltipText(): string[] {
        return this.getStringLevelField("gtp1")
    }

    public set tooltipText(tooltipText: ObjectDataEntryLevelFieldValueSupplier<string>) {
        this.setStringLevelField("gtp1", tooltipText)
    }

    public get tooltipExtendedText(): string[] {
        return this.getStringLevelField("gub1")
    }

    public set tooltipExtendedText(
        tooltipExtendedText: ObjectDataEntryLevelFieldValueSupplier<string>
    ) {
        this.setStringLevelField("gub1", tooltipExtendedText)
    }

    // Helpers

    private getEffect(i: number): UpgradeEffect | undefined {
        const effectType = this.getStringField(`gef${i}`)
        if (effectType == UpgradeEffectType.ABILITY_LEVEL_BONUS) {
            return {
                type: effectType,
                bonusBase: this.getNumberField(`gba${i}`),
                bonusIncrement: this.getNumberField(`gmo${i}`),
                abilityTypeId: this.getObjectDataEntryIdField(`gco${i}`),
            }
        }
        return undefined
    }

    private setEffect(i: number, effect: UpgradeEffect | undefined) {
        this.setStringField(`gef${i}`, effect?.type ?? "_")
        this.setNumberField(`gba${i}`, effect?.bonusBase ?? 0)
        this.setNumberField(`gmo${i}`, effect?.bonusIncrement ?? 0)
        if (effect?.abilityTypeId != undefined) {
            this.setObjectDataEntryIdField(`gco${i}`, effect?.abilityTypeId)
        } else {
            this.setStringField(`gco${i}`, "")
        }
    }
}
