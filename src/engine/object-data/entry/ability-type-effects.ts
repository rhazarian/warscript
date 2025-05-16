import { Unit } from "../../internal/unit"
import "../internal/unit/ability"
import { EventListenerPriority } from "../../../event"
import { Timer } from "../../../core/types/timer"
import { Effect } from "../../../core/types/effect"
import { Ability } from "../../internal/ability"
import {
    AbilityTypeId,
    casterCastingEffectAttachmentPointsByAbilityTypeId,
    casterCastingEffectModelPathsByAbilityTypeId,
    casterChannelingEffectAttachmentPointsByAbilityTypeId,
    casterChannelingEffectModelPathsByAbilityTypeId,
} from "./ability-type"

const castAnimationFQNByAbilityTypeId = new LuaMap<AbilityTypeId, string>()

for (const [abilityTypeId, animationFQN] of postcompile(() => castAnimationFQNByAbilityTypeId)) {
    Unit.abilityCastingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        (caster, ability) => {
            if (ability.getField(ABILITY_RLF_CASTING_TIME) != 0) {
                Timer.run(() => {
                    caster.playAnimation(animationFQN)
                })
            }
        },
    )
}

const casterCastingEffectsByCaster = new LuaMap<Unit, Effect[]>()

const handleAbilityCastingStartEvent = (caster: Unit, ability: Ability): void => {
    const effectModelPaths = casterCastingEffectModelPathsByAbilityTypeId.get(ability.typeId)
    const attachmentPoints = casterCastingEffectAttachmentPointsByAbilityTypeId.get(ability.typeId)
    const effects: Effect[] = []
    if (effectModelPaths != undefined) {
        for (const i of $range(1, effectModelPaths.length)) {
            const effectModelPath = effectModelPaths[i - 1]
            let attachmentPoint = attachmentPoints && attachmentPoints[i - 1]
            if (attachmentPoint == undefined || attachmentPoint == "") {
                attachmentPoint = "origin"
            }
            effects[i - 1] = Effect.createTarget(effectModelPath, caster, attachmentPoint)
        }
    }
    casterCastingEffectsByCaster.set(caster, effects)
}

const handleAbilityStopCastingEvent = (caster: Unit): void => {
    const effects = casterCastingEffectsByCaster.get(caster)
    if (effects != undefined) {
        for (const i of $range(1, effects.length)) {
            effects[i - 1].destroy()
        }
        casterCastingEffectsByCaster.delete(caster)
    }
}

for (const [abilityTypeId] of casterCastingEffectModelPathsByAbilityTypeId) {
    Unit.abilityCastingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityCastingStartEvent,
    )
    Unit.abilityChannelingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopCastingEvent,
    )
    Unit.abilityStopEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopCastingEvent,
    )
}

const casterChannelingEffectsByCaster = new LuaMap<Unit, Effect[]>()

const handleAbilityChannelingStartEvent = (caster: Unit, ability: Ability): void => {
    const effectModelPaths = casterChannelingEffectModelPathsByAbilityTypeId.get(ability.typeId)
    const attachmentPoints = casterChannelingEffectAttachmentPointsByAbilityTypeId.get(
        ability.typeId,
    )
    const effects: Effect[] = []
    if (effectModelPaths != undefined) {
        for (const i of $range(1, effectModelPaths.length)) {
            const effectModelPath = effectModelPaths[i - 1]
            let attachmentPoint = attachmentPoints && attachmentPoints[i - 1]
            if (attachmentPoint == undefined || attachmentPoint == "") {
                attachmentPoint = "origin"
            }
            effects[i - 1] = Effect.createTarget(effectModelPath, caster, attachmentPoint)
        }
    }
    casterChannelingEffectsByCaster.set(caster, effects)
}

const handleAbilityStopChannelingEvent = (caster: Unit): void => {
    const effects = casterChannelingEffectsByCaster.get(caster)
    if (effects != undefined) {
        for (const i of $range(1, effects.length)) {
            effects[i - 1].destroy()
        }
        casterChannelingEffectsByCaster.delete(caster)
    }
}

for (const [abilityTypeId] of casterChannelingEffectModelPathsByAbilityTypeId) {
    Unit.abilityChannelingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityChannelingStartEvent,
    )
    Unit.abilityChannelingFinishEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopChannelingEvent,
    )
    Unit.abilityStopEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopChannelingEvent,
    )
}
