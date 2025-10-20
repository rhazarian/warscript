import { Ability, ItemAbility, UnitAbility } from "./ability"
import { Unit } from "./unit"

import { createDispatchingEvent, DispatchingEvent, Event, EventListenerPriority } from "../../event"

declare module "./unit" {
    namespace Unit {
        const abilityGainedEvent: DispatchingEvent<[Unit, Ability]>
        const abilityLostEvent: DispatchingEvent<[Unit, Ability]>
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

Unit.itemPickedUpEvent.addListener(EventListenerPriority.LOWEST, (unit, item) => {
    for (const ability of item.abilities) {
        Event.invoke(abilityGainedEvent, unit, ability)
    }
})

Unit.itemDroppedEvent.addListener(EventListenerPriority.HIGHEST, (unit, item) => {
    for (const ability of item.abilities) {
        Event.invoke(abilityLostEvent, unit, ability)
    }
})
