import { Ability, ItemAbility, UnitAbility } from "./ability"
import { Unit } from "./unit"

import { createDispatchingEvent, DispatchingEvent, Event, EventListenerPriority } from "../../event"
import {
    rawDecUnitAbilityLevel,
    rawIncUnitAbilityLevel,
    rawSetUnitAbilityLevel,
} from "./misc/unit-ability-level-natives"

declare module "./unit" {
    namespace Unit {
        const abilityGainedEvent: DispatchingEvent<[Unit, Ability]>
        const abilityLostEvent: DispatchingEvent<[Unit, Ability]>
        const abilityLevelChangedEvent: DispatchingEvent<[Unit, UnitAbility]>
    }
}
const abilityGainedEvent = createDispatchingEvent(
    new Event<[Unit, Ability]>(),
    (unit, ability) => ability.typeId,
)
rawset(Unit, "abilityGainedEvent", abilityGainedEvent)
const abilityLostEvent = createDispatchingEvent(
    new Event<[Unit, Ability]>(),
    (unit, ability) => ability.typeId,
)
rawset(Unit, "abilityLostEvent", abilityLostEvent)
const abilityLevelChangedEvent = createDispatchingEvent(
    new Event<[Unit, UnitAbility]>(),
    (unit, ability) => ability.typeId,
)
rawset(Unit, "abilityLevelChangedEvent", abilityLevelChangedEvent)

const getUnitAbilityLevel = GetUnitAbilityLevel

const invokeAbilityLevelChangedEvent = (unitHandle: junit, abilityTypeId: number): void => {
    const unit = Unit.of(unitHandle)
    if (unit != undefined) {
        const ability = unit.getAbility(abilityTypeId)
        if (ability != undefined) {
            Event.invoke(abilityLevelChangedEvent, unit, ability)
        }
    }
}

const invokeAbilityLevelChangedEventIfChanged = (
    unitHandle: junit,
    abilityTypeId: number,
    previousLevel: number,
): void => {
    // Gaining and losing the ability are reported by the gained / lost events.
    if (previousLevel != 0) {
        const level = getUnitAbilityLevel(unitHandle, abilityTypeId)
        if (level != 0 && level != previousLevel) {
            invokeAbilityLevelChangedEvent(unitHandle, abilityTypeId)
        }
    }
}

_G.SetUnitAbilityLevel = (whichUnit, abilcode, level) => {
    const previousLevel = getUnitAbilityLevel(whichUnit, abilcode)
    const result = rawSetUnitAbilityLevel(whichUnit, abilcode, level)
    invokeAbilityLevelChangedEventIfChanged(whichUnit, abilcode, previousLevel)
    return result
}

_G.IncUnitAbilityLevel = (whichUnit, abilcode) => {
    const previousLevel = getUnitAbilityLevel(whichUnit, abilcode)
    const result = rawIncUnitAbilityLevel(whichUnit, abilcode)
    invokeAbilityLevelChangedEventIfChanged(whichUnit, abilcode, previousLevel)
    return result
}

_G.DecUnitAbilityLevel = (whichUnit, abilcode) => {
    const previousLevel = getUnitAbilityLevel(whichUnit, abilcode)
    const result = rawDecUnitAbilityLevel(whichUnit, abilcode)
    invokeAbilityLevelChangedEventIfChanged(whichUnit, abilcode, previousLevel)
    return result
}

const heroSkillTrigger = CreateTrigger()
TriggerRegisterAnyUnitEventBJ(heroSkillTrigger, EVENT_PLAYER_HERO_SKILL)
TriggerAddCondition(
    heroSkillTrigger,
    Condition(() => {
        // Learning the first level is reported by the gained event.
        if (GetLearnedSkillLevel() > 1) {
            const unitHandle = GetTriggerUnit()
            if (unitHandle != undefined) {
                invokeAbilityLevelChangedEvent(unitHandle, GetLearnedSkill())
            }
        }
    }),
)

UnitAbility.onCreate.addListener(EventListenerPriority.LOWEST, (ability) => {
    Event.invoke(abilityGainedEvent, ability.owner, ability)
})

UnitAbility.destroyEvent.addListener(EventListenerPriority.HIGHEST, (ability) => {
    Event.invoke(abilityLostEvent, ability.owner, ability)
})

ItemAbility.onCreate.addListener(EventListenerPriority.LOWEST, (ability) => {
    const unit = ability.owner.owner
    if (unit != undefined) {
        Event.invoke(abilityGainedEvent, unit, ability)
    }
})

ItemAbility.destroyEvent.addListener(EventListenerPriority.HIGHEST, (ability) => {
    const unit = ability.owner.owner
    if (unit != undefined) {
        Event.invoke(abilityLostEvent, unit, ability)
    }
})

// TODO: check if inventory can use abilities

Unit.itemPickedUpEvent.addListener(EventListenerPriority.LOWEST_INTERNAL, (unit, item) => {
    for (const ability of item.abilities) {
        Event.invoke(abilityGainedEvent, unit, ability)
    }
})

Unit.itemDroppedEvent.addListener(EventListenerPriority.HIGHEST_INTERNAL, (unit, item) => {
    for (const ability of item.abilities) {
        Event.invoke(abilityLostEvent, unit, ability)
    }
})
