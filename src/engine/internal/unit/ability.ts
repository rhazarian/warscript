import { Ability, ItemAbility, UnitAbility, UnrecognizedAbility } from "../ability"
import { Destructable } from "../../../core/types/destructable"
import { Item } from "../item"
import { Unit, UnitTriggerEvent } from "../unit"
import { Widget } from "../../../core/types/widget"

import {
    createDispatchingEvent,
    DependentInitializingEvent,
    DispatchingEvent,
    Event,
    EventListenerPriority,
    InitializingEvent,
} from "../../../event"
import { checkNotNull } from "../../../utility/preconditions"
import { lazyRecord } from "../../../utility/lazy"
import { Timer } from "../../../core/types/timer"

const eventInvoke = Event.invoke

const condition = Condition
const createTrigger = CreateTrigger
const getItemAbility = BlzGetItemAbility
const getSpellAbility = GetSpellAbility
const getSpellAbilityId = GetSpellAbilityId
const getSpellTargetDestructible = GetSpellTargetDestructable
const getSpellTargetItem = GetSpellTargetItem
const getSpellTargetUnit = GetSpellTargetUnit
const getSpellTargetX = GetSpellTargetX
const getSpellTargetY = GetSpellTargetY
const getTriggerUnit = GetTriggerUnit
const triggerAddCondition = TriggerAddCondition
const triggerRegisterCommandEvent = TriggerRegisterCommandEvent
const unitInventorySize = UnitInventorySize
const unitItemInSlot = UnitItemInSlot

const retrieveAbility = (
    unit: junit,
    ability: jability | undefined,
    abilityId: number,
): Ability => {
    if (ability == undefined) {
        return new UnrecognizedAbility(abilityId, Unit.of(unit))
    }
    for (const i of $range(0, unitInventorySize(unit) - 1)) {
        const item = unitItemInSlot(unit, i)
        if (getItemAbility(item, abilityId) == ability) {
            return ItemAbility.of(ability, abilityId, Item.of(item))
        }
    }
    return UnitAbility.of(ability, abilityId, Unit.of(unit))
}

type InternalUnitAbilityEventParameters = [
    caster: Unit,
    ability: Ability,
    targetUnit: junit | undefined,
    targetItem: jitem | undefined,
    targetDestructible: jdestructable | undefined,
    x: number,
    y: number,
]

const collectInternalUnitAbilityEventParameters =
    (): LuaMultiReturn<InternalUnitAbilityEventParameters> => {
        const unit = checkNotNull(getTriggerUnit())
        return $multi(
            Unit.of(unit),
            retrieveAbility(unit, getSpellAbility(), getSpellAbilityId()),
            getSpellTargetUnit(),
            getSpellTargetItem(),
            getSpellTargetDestructible(),
            getSpellTargetX(),
            getSpellTargetY(),
        )
    }

const collectUnitAbilityEventParameters = (): LuaMultiReturn<[Unit, Ability]> => {
    const unit = checkNotNull(getTriggerUnit())
    return $multi(Unit.of(unit), retrieveAbility(unit, getSpellAbility(), getSpellAbilityId()))
}

const createCommonEvent = (
    underlyingEvent: Event<InternalUnitAbilityEventParameters>,
): Event<[caster: Unit, ability: Ability]> => {
    return new DependentInitializingEvent(
        underlyingEvent,
        EventListenerPriority.HIGH,
        (caster, ability) => {
            return $multi(true as const, caster, ability)
        },
    )
}

const createWidgetTargetEvent = (
    underlyingEvent: Event<InternalUnitAbilityEventParameters>,
): Event<[caster: Unit, ability: Ability, target: Widget]> => {
    return new DependentInitializingEvent(
        underlyingEvent,
        EventListenerPriority.MEDIUM,
        (caster, ability, targetUnit, targetItem, targetDestructible) => {
            if (
                targetUnit != undefined ||
                targetItem != undefined ||
                targetDestructible != undefined
            ) {
                return $multi(
                    true as const,
                    caster,
                    ability,
                    (Unit.of(targetUnit) ??
                        Item.of(targetItem) ??
                        Destructable.of(targetDestructible)) as Widget,
                )
            } else {
                return $multi(false as const)
            }
        },
    )
}

const createUnitTargetEvent = (
    underlyingEvent: Event<InternalUnitAbilityEventParameters>,
): Event<[caster: Unit, ability: Ability, target: Unit]> => {
    return new DependentInitializingEvent(
        underlyingEvent,
        EventListenerPriority.LOW,
        (caster, ability, targetUnit) => {
            if (targetUnit != undefined) {
                return $multi(true as const, caster, ability, Unit.of(targetUnit))
            } else {
                return $multi(false as const)
            }
        },
    )
}

const createItemTargetEvent = (
    underlyingEvent: Event<InternalUnitAbilityEventParameters>,
): Event<[caster: Unit, ability: Ability, target: Item]> => {
    return new DependentInitializingEvent(
        underlyingEvent,
        EventListenerPriority.LOW,
        (caster, ability, targetUnit, targetItem) => {
            if (targetItem != undefined) {
                return $multi(true as const, caster, ability, Item.of(targetItem))
            } else {
                return $multi(false as const)
            }
        },
    )
}

const createDestructibleTargetEvent = (
    underlyingEvent: Event<InternalUnitAbilityEventParameters>,
): Event<[caster: Unit, ability: Ability, target: Destructable]> => {
    return new DependentInitializingEvent(
        underlyingEvent,
        EventListenerPriority.LOW,
        (caster, ability, targetUnit, targetItem, targetDestructible) => {
            if (targetDestructible != undefined) {
                return $multi(true as const, caster, ability, Destructable.of(targetDestructible))
            } else {
                return $multi(false as const)
            }
        },
    )
}

const createPointTargetEvent = (
    underlyingEvent: Event<InternalUnitAbilityEventParameters>,
): Event<[caster: Unit, ability: Ability, x: number, y: number]> => {
    return new DependentInitializingEvent(
        underlyingEvent,
        EventListenerPriority.LOW,
        (caster, ability, targetUnit, targetItem, targetDestructible, x, y) => {
            if (
                x != 0 &&
                y != 0 &&
                targetUnit == undefined &&
                targetItem == undefined &&
                targetDestructible == undefined
            ) {
                return $multi(true as const, caster, ability, x, y)
            } else {
                return $multi(false as const)
            }
        },
    )
}

const createNoTargetEvent = (
    underlyingEvent: Event<InternalUnitAbilityEventParameters>,
): Event<[caster: Unit, ability: Ability]> => {
    return new DependentInitializingEvent(
        underlyingEvent,
        EventListenerPriority.LOW,
        (caster, ability, targetUnit, targetItem, targetDestructible, x, y) => {
            if (
                x == 0 &&
                y == 0 &&
                targetUnit == undefined &&
                targetItem == undefined &&
                targetDestructible == undefined
            ) {
                return $multi(true as const, caster, ability)
            } else {
                return $multi(false as const)
            }
        },
    )
}

const extractAbilityTypeId = (unit: Unit, ability: Ability) => ability.typeId

// === CASTING START ===

const internalAbilityCastingStartEvent = new UnitTriggerEvent(
    EVENT_PLAYER_UNIT_SPELL_CHANNEL,
    collectInternalUnitAbilityEventParameters,
)

declare module "../unit" {
    namespace Unit {
        const abilityCastingStartEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityCastingStartEvent",
    createDispatchingEvent(
        createCommonEvent(internalAbilityCastingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityWidgetTargetCastingStartEvent: DispatchingEvent<[Unit, Ability, Widget]>
    }
}
rawset(
    Unit,
    "abilityWidgetTargetCastingStartEvent",
    createDispatchingEvent(
        createWidgetTargetEvent(internalAbilityCastingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityUnitTargetCastingStartEvent: DispatchingEvent<[Unit, Ability, Unit]>
    }
}
rawset(
    Unit,
    "abilityUnitTargetCastingStartEvent",
    createDispatchingEvent(
        createUnitTargetEvent(internalAbilityCastingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityItemTargetCastingStartEvent: DispatchingEvent<[Unit, Ability, Item]>
    }
}
rawset(
    Unit,
    "abilityItemTargetCastingStartEvent",
    createDispatchingEvent(
        createItemTargetEvent(internalAbilityCastingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityDestructibleTargetCastingStartEvent: DispatchingEvent<
            [Unit, Ability, Destructable]
        >
    }
}
rawset(
    Unit,
    "abilityDestructibleTargetCastingStartEvent",
    createDispatchingEvent(
        createDestructibleTargetEvent(internalAbilityCastingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityPointTargetCastingStartEvent: DispatchingEvent<[Unit, Ability, number, number]>
    }
}
rawset(
    Unit,
    "abilityPointTargetCastingStartEvent",
    createDispatchingEvent(
        createPointTargetEvent(internalAbilityCastingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityNoTargetCastingStartEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityNoTargetCastingStartEvent",
    createDispatchingEvent(
        createNoTargetEvent(internalAbilityCastingStartEvent),
        extractAbilityTypeId,
    ),
)

// === CASTING FINISH ===

const internalAbilityCastingFinishEvent = new UnitTriggerEvent(
    EVENT_PLAYER_UNIT_SPELL_CAST,
    collectInternalUnitAbilityEventParameters,
)

declare module "../unit" {
    namespace Unit {
        const abilityCastingFinishEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityCastingFinishEvent",
    createDispatchingEvent(
        createCommonEvent(internalAbilityCastingFinishEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityWidgetTargetCastingFinishEvent: DispatchingEvent<[Unit, Ability, Widget]>
    }
}
rawset(
    Unit,
    "abilityWidgetTargetCastingFinishEvent",
    createDispatchingEvent(
        createWidgetTargetEvent(internalAbilityCastingFinishEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityUnitTargetCastingFinishEvent: DispatchingEvent<[Unit, Ability, Unit]>
    }
}
rawset(
    Unit,
    "abilityUnitTargetCastingFinishEvent",
    createDispatchingEvent(
        createUnitTargetEvent(internalAbilityCastingFinishEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityItemTargetCastingFinishEvent: DispatchingEvent<[Unit, Ability, Item]>
    }
}
rawset(
    Unit,
    "abilityItemTargetCastingFinishEvent",
    createDispatchingEvent(
        createItemTargetEvent(internalAbilityCastingFinishEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityDestructibleTargetCastingFinishEvent: DispatchingEvent<
            [Unit, Ability, Destructable]
        >
    }
}
rawset(
    Unit,
    "abilityDestructibleTargetCastingFinishEvent",
    createDispatchingEvent(
        createDestructibleTargetEvent(internalAbilityCastingFinishEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityPointTargetCastingFinishEvent: DispatchingEvent<
            [Unit, Ability, number, number]
        >
    }
}
rawset(
    Unit,
    "abilityPointTargetCastingFinishEvent",
    createDispatchingEvent(
        createPointTargetEvent(internalAbilityCastingFinishEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityNoTargetCastingFinishEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityNoTargetCastingFinishEvent",
    createDispatchingEvent(
        createNoTargetEvent(internalAbilityCastingFinishEvent),
        extractAbilityTypeId,
    ),
)

// === CHANNELING START ===

const internalAbilityChannelingStartEvent = new UnitTriggerEvent(
    EVENT_PLAYER_UNIT_SPELL_EFFECT,
    collectInternalUnitAbilityEventParameters,
)

declare module "../unit" {
    namespace Unit {
        const abilityChannelingStartEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityChannelingStartEvent",
    createDispatchingEvent(
        createCommonEvent(internalAbilityChannelingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityWidgetTargetChannelingStartEvent: DispatchingEvent<[Unit, Ability, Widget]>
    }
}
rawset(
    Unit,
    "abilityWidgetTargetChannelingStartEvent",
    createDispatchingEvent(
        createWidgetTargetEvent(internalAbilityChannelingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityUnitTargetChannelingStartEvent: DispatchingEvent<[Unit, Ability, Unit]>
    }
}
rawset(
    Unit,
    "abilityUnitTargetChannelingStartEvent",
    createDispatchingEvent(
        createUnitTargetEvent(internalAbilityChannelingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityItemTargetChannelingStartEvent: DispatchingEvent<[Unit, Ability, Item]>
    }
}
rawset(
    Unit,
    "abilityItemTargetChannelingStartEvent",
    createDispatchingEvent(
        createItemTargetEvent(internalAbilityChannelingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityDestructibleTargetChannelingStartEvent: DispatchingEvent<
            [Unit, Ability, Destructable]
        >
    }
}
rawset(
    Unit,
    "abilityDestructibleTargetChannelingStartEvent",
    createDispatchingEvent(
        createDestructibleTargetEvent(internalAbilityChannelingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityPointTargetChannelingStartEvent: DispatchingEvent<
            [Unit, Ability, number, number]
        >
    }
}
rawset(
    Unit,
    "abilityPointTargetChannelingStartEvent",
    createDispatchingEvent(
        createPointTargetEvent(internalAbilityChannelingStartEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityNoTargetChannelingStartEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityNoTargetChannelingStartEvent",
    createDispatchingEvent(
        createNoTargetEvent(internalAbilityChannelingStartEvent),
        extractAbilityTypeId,
    ),
)

// === IMPACT ===

const internalAbilityImpactEvent = new Event<InternalUnitAbilityEventParameters>()

internalAbilityChannelingStartEvent.addListener((...parameters) => {
    Timer.run(eventInvoke, internalAbilityImpactEvent, ...parameters)
})

declare module "../unit" {
    namespace Unit {
        const abilityImpactEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityImpactEvent",
    createDispatchingEvent(createCommonEvent(internalAbilityImpactEvent), extractAbilityTypeId),
)

declare module "../unit" {
    namespace Unit {
        const abilityWidgetTargetImpactEvent: DispatchingEvent<[Unit, Ability, Widget]>
    }
}
rawset(
    Unit,
    "abilityWidgetTargetImpactEvent",
    createDispatchingEvent(
        createWidgetTargetEvent(internalAbilityImpactEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityUnitTargetImpactEvent: DispatchingEvent<[Unit, Ability, Unit]>
    }
}
rawset(
    Unit,
    "abilityUnitTargetImpactEvent",
    createDispatchingEvent(createUnitTargetEvent(internalAbilityImpactEvent), extractAbilityTypeId),
)

declare module "../unit" {
    namespace Unit {
        const abilityItemTargetImpactEvent: DispatchingEvent<[Unit, Ability, Item]>
    }
}
rawset(
    Unit,
    "abilityItemTargetImpactEvent",
    createDispatchingEvent(createItemTargetEvent(internalAbilityImpactEvent), extractAbilityTypeId),
)

declare module "../unit" {
    namespace Unit {
        const abilityDestructibleTargetImpactEvent: DispatchingEvent<[Unit, Ability, Destructable]>
    }
}
rawset(
    Unit,
    "abilityDestructibleTargetImpactEvent",
    createDispatchingEvent(
        createDestructibleTargetEvent(internalAbilityImpactEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityPointTargetImpactEvent: DispatchingEvent<[Unit, Ability, number, number]>
    }
}
rawset(
    Unit,
    "abilityPointTargetImpactEvent",
    createDispatchingEvent(
        createPointTargetEvent(internalAbilityImpactEvent),
        extractAbilityTypeId,
    ),
)

declare module "../unit" {
    namespace Unit {
        const abilityNoTargetImpactEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityNoTargetImpactEvent",
    createDispatchingEvent(createNoTargetEvent(internalAbilityImpactEvent), extractAbilityTypeId),
)

// === CHANNELING FINISH ===

declare module "../unit" {
    namespace Unit {
        const abilityChannelingFinishEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityChannelingFinishEvent",
    createDispatchingEvent(
        new UnitTriggerEvent<[Ability]>(
            EVENT_PLAYER_UNIT_SPELL_FINISH,
            collectUnitAbilityEventParameters,
        ),
        extractAbilityTypeId,
    ),
)

// === STOP ===

declare module "../unit" {
    namespace Unit {
        const abilityStopEvent: DispatchingEvent<[Unit, Ability]>
    }
}
rawset(
    Unit,
    "abilityStopEvent",
    createDispatchingEvent(
        new UnitTriggerEvent<[Ability]>(
            EVENT_PLAYER_UNIT_SPELL_ENDCAST,
            collectUnitAbilityEventParameters,
        ),
        extractAbilityTypeId,
    ),
)

// === COMMAND ===

declare module "../unit" {
    namespace Unit {
        const abilityCommandEvent: {
            readonly [abilityTypeId: number]: {
                readonly [orderTypeStringId: string]: Event<[Unit, Ability, string]>
            }
        }
    }
}
rawset(
    Unit,
    "abilityCommandEvent",
    lazyRecord((abilityTypeId: number) => {
        return lazyRecord((orderTypeStringId: string) => {
            return new InitializingEvent<[Unit, Ability, string]>((event) => {
                const trigger = createTrigger()
                triggerRegisterCommandEvent(trigger, abilityTypeId, orderTypeStringId)
                triggerAddCondition(
                    trigger,
                    condition(() => {
                        const unit = Unit.of(getTriggerUnit())
                        if (unit !== undefined) {
                            const ability = unit.getAbility(abilityTypeId)
                            if (ability !== undefined) {
                                eventInvoke(event, unit, ability, orderTypeStringId)
                            }
                        }
                    }),
                )
            })
        })
    }),
)
