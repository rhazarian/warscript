import { ChannelAbilityType, ChannelAbilityTypeTargetingType } from "./channel"

import { AbilityTypeId } from "../ability-type"

import { AnimationName, isAnimationName } from "../../auxiliary/animation-name"
import { TargetingType } from "../../auxiliary/targeting-type"
import { orderTypeStringIdFactory } from "../../utility/order-type-string-id-factory"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

import { Timer } from "../../../../core/types/timer"
import { Unit } from "../../../../core/types/unit"
import { EventListenerPriority } from "../../../../event"
import { toLuaSet } from "../../../../utility/arrays"
import { checkNotNull } from "../../../../utility/preconditions"
import { CombatClassifications } from "../../auxiliary/combat-classification"
import {
    ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
    AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
} from "../../../standard/fields/ability"
import { LinkedSet } from "../../../../utility/linked-set"
import { Ability } from "../../../internal/ability"
import { Sound3D, SoundPreset } from "../../../../core/types/sound"
import { AnimationQualifier } from "../../auxiliary/animation-qualifier"

const isChannelingAbilityTypeIds = new LuaSet<AbilityTypeId>()
const usesAttackAnimationByAbilityTypeId = new LuaMap<AbilityTypeId, boolean>()

export class BlankConfigurableAbilityType extends ChannelAbilityType {
    public static override readonly IS_SYNTHETIC = true

    private autoOrderTypeStringIdsEnabled = true

    private readonly autoOrderTypeStringIdByTargetingType = {} as Record<
        ChannelAbilityTypeTargetingType,
        string | undefined
    >

    private _usesAttackAnimation = false
    private _isChanneling = false

    public constructor(object: WarObject) {
        super(object)
        this.buttonPositionX = 0
        this.buttonPositionY = 0
        this.casterAttachmentPresets = []
        this.effectModelPaths = []
        this.targetEffectPresets = []
        this.levelCount = 1
        this.channelingDuration = 0
        this.isTargetingImageVisible = false
        this.isPhysical = false
        this.isUniversal = false
        this.isUniqueCast = true
        this.casterAttachmentPresetsDuration = 0
        this.disablesOtherAbilities = false

        this.setAutoOrderTypeStringIds()

        usesAttackAnimationByAbilityTypeId.set(this.id, false)
    }

    public get usesAttackAnimation(): boolean {
        return this._usesAttackAnimation
    }

    public set usesAttackAnimation(usesAttackAnimation: boolean) {
        usesAttackAnimationByAbilityTypeId.set(this.id, usesAttackAnimation)
        this._usesAttackAnimation = usesAttackAnimation
    }

    public get isChanneling(): boolean {
        return this._isChanneling
    }

    public set isChanneling(isChanneling: boolean) {
        if (isChanneling) {
            isChannelingAbilityTypeIds.add(this.id)
        } else {
            isChannelingAbilityTypeIds.delete(this.id)
        }
        this._isChanneling = isChanneling
    }

    public override get targetingType(): ChannelAbilityTypeTargetingType[] {
        return this.getNumberLevelField("Ncl2")
    }

    public override set targetingType(
        targetingType: ObjectDataEntryLevelFieldValueSupplier<ChannelAbilityTypeTargetingType>,
    ) {
        this.setNumberLevelField("Ncl2", targetingType)
        if (this.autoOrderTypeStringIdsEnabled) {
            this.setAutoOrderTypeStringIds()
        }
    }

    public override get baseOrderTypeStringId(): string[] {
        return this.getStringLevelField("Ncl6")
    }

    public override set baseOrderTypeStringId(
        baseOrderTypeStringId: ObjectDataEntryLevelFieldValueSupplier<string>,
    ) {
        this.autoOrderTypeStringIdsEnabled = false
        this.setStringLevelField("Ncl6", baseOrderTypeStringId)
    }

    private setAutoOrderTypeStringIds(): void {
        const targetingTypes = toLuaSet(this.targetingType)

        const unusedTargetingTypes: ChannelAbilityTypeTargetingType[] = []
        for (const [targetingType, orderTypeStringId] of pairs(
            this.autoOrderTypeStringIdByTargetingType,
        )) {
            if (!targetingTypes.has(targetingType)) {
                unusedTargetingTypes.push(targetingType)
                orderTypeStringIdFactory.recycle(orderTypeStringId)
            }
        }
        for (const unusedTargetingType of unusedTargetingTypes) {
            this.autoOrderTypeStringIdByTargetingType[unusedTargetingType] = undefined
        }

        for (const targetingType of targetingTypes) {
            if (this.autoOrderTypeStringIdByTargetingType[targetingType] == undefined) {
                this.autoOrderTypeStringIdByTargetingType[targetingType] =
                    orderTypeStringIdFactory.next(targetingType as number as TargetingType)
            }
        }

        this.baseOrderTypeStringId = (level) => {
            return checkNotNull(
                this.autoOrderTypeStringIdByTargetingType[this.targetingType[level]],
            )
        }
    }
}

{
    type ChannelInfo = {
        abilityTypeId: AbilityTypeId
        areaOfEffect: number
        allowedTargetCombatClassifications: CombatClassifications
        target: Unit
    }

    const channelInfoByCaster = new LuaMap<Unit, ChannelInfo>()

    const castersByTarget = new LuaMap<Unit, LinkedSet<Unit>>()

    const targets = new LinkedSet<Unit>()

    {
        const abilityUnitTargetChannelingStartEventListener = (
            caster: Unit,
            ability: Ability,
            target: Unit,
        ): void => {
            targets.add(target)

            let casters = castersByTarget.get(target)
            if (casters == undefined) {
                casters = new LinkedSet<Unit>()
                castersByTarget.set(target, casters)
            }
            casters.add(caster)

            channelInfoByCaster.set(caster, {
                abilityTypeId: ability.typeId,
                areaOfEffect: AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD.getValue(
                    ability,
                    ability.level,
                ),
                allowedTargetCombatClassifications:
                    ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD.getValue(
                        ability,
                        ability.level,
                    ),
                target: target,
            })
        }

        const abilityStopEventListener = (caster: Unit): void => {
            const channelInfo = channelInfoByCaster.get(caster)
            if (channelInfo != undefined) {
                channelInfoByCaster.delete(caster)

                const casters = castersByTarget.get(channelInfo.target)
                if (casters != undefined) {
                    casters.remove(caster)
                }

                targets.remove(channelInfo.target)
            }
        }

        for (const abilityTypeId of postcompile(() => isChannelingAbilityTypeIds)) {
            Unit.abilityUnitTargetChannelingStartEvent[abilityTypeId].addListener(
                EventListenerPriority.LOWEST,
                abilityUnitTargetChannelingStartEventListener,
            )
            Unit.abilityStopEvent[abilityTypeId].addListener(abilityStopEventListener)
        }
    }

    const unitChangeEventListener = (unit: Unit): void => {
        const casters = castersByTarget.get(unit)
        if (casters != undefined) {
            for (const caster of casters) {
                const channelInfo = channelInfoByCaster.get(caster)
                if (channelInfo != undefined) {
                    if (
                        !unit.isAllowedTarget(
                            caster,
                            channelInfo.allowedTargetCombatClassifications,
                        ) ||
                        unit.isInvisibleTo(caster.owner) ||
                        (channelInfo.areaOfEffect > 0 &&
                            caster.getCollisionDistanceTo(unit) > channelInfo.areaOfEffect) ||
                        unit.transport != undefined
                    ) {
                        caster.interruptCast(channelInfo.abilityTypeId)
                    }
                }
            }
        }
    }

    Unit.abilityChannelingStartEvent.addListener(EventListenerPriority.HIGHEST, (caster) => {
        unitChangeEventListener(caster)
        Timer.run(unitChangeEventListener, caster)
    })

    Unit.abilityUnitTargetChannelingStartEvent.addListener(
        EventListenerPriority.HIGHEST,
        (caster, ability, target) => {
            unitChangeEventListener(target)
            Timer.run(unitChangeEventListener, target)
        },
    )

    Unit.onBoard.addListener(EventListenerPriority.HIGHEST, unitChangeEventListener)

    Unit.deathEvent.addListener(EventListenerPriority.HIGHEST, unitChangeEventListener)

    Timer.onPeriod[1].addListener(EventListenerPriority.HIGHEST, () => {
        for (const target of targets) {
            unitChangeEventListener(target)
        }
    })
}

for (const [abilityTypeId, usesAttackAnimation] of postcompile(() => {
    for (const [abilityTypeId, usesAttackAnimation] of usesAttackAnimationByAbilityTypeId) {
        if (usesAttackAnimation) {
            const abilityType = checkNotNull(BlankConfigurableAbilityType.of(abilityTypeId))
            if (isAnimationName(abilityType.channelingAnimation[0])) {
                if (abilityType.channelingAnimation[0] != AnimationName.ATTACK) {
                    abilityType.channelingAnimation = [AnimationName.ATTACK]
                }
            } else {
                abilityType.channelingAnimation = [
                    AnimationName.ATTACK,
                    ...(abilityType.channelingAnimation as AnimationQualifier[]),
                ]
            }
        }
    }
    return usesAttackAnimationByAbilityTypeId
})) {
    Unit.abilityCastingFinishEvent[abilityTypeId].addListener((caster, ability) => {
        const effectSound = ability.getField(ABILITY_SF_EFFECT_SOUND)
        if (effectSound != "") {
            Sound3D.playFromLabel(effectSound, SoundPreset.Ability, caster)
        }
    })
    if (usesAttackAnimation) {
        Unit.abilityCastingStartEvent[abilityTypeId].addListener(
            EventListenerPriority.HIGHEST,
            (caster, ability) => {
                if (ability.getField(ABILITY_RLF_CASTING_TIME) != 0) {
                    Timer.run(() => {
                        caster.playAnimation("ready")
                    })
                }
            },
        )
        Unit.abilityCastingFinishEvent[abilityTypeId].addListener((caster, ability) => {
            if (ability.getField(ABILITY_RLF_FOLLOW_THROUGH_TIME) == 0) {
                ability.setField(
                    ABILITY_RLF_FOLLOW_THROUGH_TIME,
                    BlzGetUnitWeaponRealField(
                        caster.handle,
                        UNIT_WEAPON_RF_ATTACK_BACKSWING_POINT,
                        0,
                    ) +
                        BlzGetUnitWeaponRealField(
                            caster.handle,
                            UNIT_WEAPON_RF_ATTACK_DAMAGE_POINT,
                            0,
                        ) -
                        caster.getField(UNIT_RF_CAST_POINT),
                )
            }
        })
    } else {
        Unit.abilityCastingFinishEvent[abilityTypeId].addListener((caster, ability) => {
            if (ability.getField(ABILITY_RLF_FOLLOW_THROUGH_TIME) == 0) {
                ability.setField(
                    ABILITY_RLF_FOLLOW_THROUGH_TIME,
                    caster.getField(UNIT_RF_CAST_BACK_SWING),
                )
            }
        })
    }
}
