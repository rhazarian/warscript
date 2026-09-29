import { ExhumeCorpsesAbilityType } from "./exhume-corpses"

import { AbilityTypeId } from "../ability-type"
import { UnitTypeId } from "../unit-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import {
    DURATION_HERO_ABILITY_FLOAT_LEVEL_FIELD,
    DURATION_NORMAL_ABILITY_FLOAT_LEVEL_FIELD,
    TOOLTIP_NORMAL_EXTENDED_ABILITY_STRING_LEVEL_FIELD,
} from "../../../standard/fields/ability"
import { overrideAbilityTypeExtendedTooltipLocally } from "../../../ability-type-extended-tooltip"
import { LocalClient } from "../../../local-client"

import { Timer } from "../../../../core/types/timer"
import { EventListenerPriority } from "../../../../event"

// Large enough to never run out, small enough to survive a conversion to milliseconds.
const NATIVE_DURATION = 2147483

const compiletimeAbilityTypeIds = new LuaSet<AbilityTypeId>()

/**
 * A passive ability whose cooldown can be started (`Ability.startCooldown`): Exhume
 * Corpses (`Aexh`) is the only passive base ability that shows a cooldown.
 *
 * The corpse fields of the underlying Exhume Corpses are fixed at zero and its native
 * durations at a practically infinite value. {@link buffDuration} and
 * {@link heroBuffDuration} are kept for scripts separately from the native fields.
 *
 * The game ignores per-ability extended tooltips of this base ability, so the type's own
 * tooltip is replaced locally with the one of the locally main selected unit's ability.
 * Read the type's tooltip with `getAbilityTypeExtendedTooltip`, not with the native.
 */
export class PassiveAbilityWithCooldownAbilityType extends ExhumeCorpsesAbilityType {
    public static override readonly IS_SYNTHETIC = true

    public constructor(object: WarObject) {
        super(object)
        this.levelCount = 1
        this.iconPath = ""
        this.targetEffectPresets = []
        this.maximumCorpseCount = () => 0
        this.corpseUnitTypeId = () => 0 as UnitTypeId
        this.setNumberLevelField("adur", () => NATIVE_DURATION)
        this.setNumberLevelField("ahdu", () => NATIVE_DURATION)
        this.buffDuration = () => 0
        this.heroBuffDuration = () => 0
        this.buffTypeIds = () => []
        this.techTreeDependencies = []
        compiletimeAbilityTypeIds.add(this.id)
    }

    // The native durations must stay practically infinite for the cooldown to work. The
    // values are stored as the object fields' own defaults instead, so the runtime fields
    // read and write them without touching the native ones.

    public override get buffDuration(): number[] {
        return DURATION_NORMAL_ABILITY_FLOAT_LEVEL_FIELD.getValue(this)
    }

    public override set buffDuration(buffDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        DURATION_NORMAL_ABILITY_FLOAT_LEVEL_FIELD.setValue(this, buffDuration)
    }

    public override get heroBuffDuration(): number[] {
        return DURATION_HERO_ABILITY_FLOAT_LEVEL_FIELD.getValue(this)
    }

    public override set heroBuffDuration(
        heroBuffDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        DURATION_HERO_ABILITY_FLOAT_LEVEL_FIELD.setValue(this, heroBuffDuration)
    }
}

const abilityTypeIds = postcompile(() => compiletimeAbilityTypeIds)

if (next(abilityTypeIds)[0] != undefined) {
    const overriddenLevelCountByAbilityTypeId = new LuaMap<AbilityTypeId, number>()

    Timer.onPeriod[1 / 32].addListener(EventListenerPriority.LOWEST, () => {
        const unit = LocalClient.mainSelectedUnit
        for (const abilityTypeId of abilityTypeIds) {
            const ability = unit?.getAbility(abilityTypeId)
            const levelCount = ability?.levelCount ?? 0
            if (ability != undefined) {
                for (const level of $range(0, levelCount - 1)) {
                    overrideAbilityTypeExtendedTooltipLocally(
                        abilityTypeId,
                        level,
                        TOOLTIP_NORMAL_EXTENDED_ABILITY_STRING_LEVEL_FIELD.getValue(ability, level),
                    )
                }
            }
            const overriddenLevelCount = overriddenLevelCountByAbilityTypeId.get(abilityTypeId) ?? 0
            for (const level of $range(levelCount, overriddenLevelCount - 1)) {
                overrideAbilityTypeExtendedTooltipLocally(abilityTypeId, level, undefined)
            }
            if (levelCount != overriddenLevelCount) {
                overriddenLevelCountByAbilityTypeId.set(abilityTypeId, levelCount)
            }
        }
    })
}
