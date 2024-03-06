import { Behavior } from "../behavior"
import { Unit } from "../unit"
import { Ability } from "../internal/ability"
import { AbilityTypeId } from "../object-data/entry/ability-type"
import { EventListener } from "../../event"
import { Widget } from "../../core/types/widget"
import { Item } from "../internal/item"
import { Destructable } from "../../core/types/destructable"
import { Effect, EffectParameters } from "../../core/types/effect"
import {
    AREA_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
    EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
    SPECIAL_EFFECT_ATTACHMENT_POINT_STRING_FIELD,
    SPECIAL_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
} from "../standard/fields/ability"
import { AbilityDependentValue, resolveCurrentAbilityDependentValue } from "../object-field/ability"
import { Timer } from "../../core/types/timer"

const createBehaviorFunctionsByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    ((ability: Ability) => AbilityBehavior)[]
>()

export type AbilityBehaviorConstructor<Args extends any[]> = new (
    ability: Ability,
    ...args: Args
) => AbilityBehavior

export abstract class AbilityBehavior<
    PeriodicActionParameters extends any[] = any[]
> extends Behavior<Ability, PeriodicActionParameters> {
    public constructor(ability: Ability) {
        super(ability)
    }

    public get ability(): Ability {
        return this.object
    }

    protected resolveCurrentAbilityDependentValue<T extends boolean | number | string>(
        value: AbilityDependentValue<T>
    ): T {
        return resolveCurrentAbilityDependentValue(this.ability, value)
    }

    protected flashAreaEffect(
        x: number,
        y: number,
        ...parametersOrDuration:
            | [parameters?: EffectParameters]
            | [duration?: number, parameters?: EffectParameters]
    ): void {
        Effect.flash(
            AREA_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(this.ability, 0),
            x,
            y,
            ...parametersOrDuration
        )
    }

    protected flashEffect(
        x: number,
        y: number,
        ...parametersOrDuration:
            | [parameters?: EffectParameters]
            | [duration?: number, parameters?: EffectParameters]
    ): void {
        Effect.flash(
            EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(this.ability, 0),
            x,
            y,
            ...parametersOrDuration
        )
    }

    protected flashSpecialEffect(
        ...args: [...pointOrWidget: [x: number, y: number] | [widget: Widget], duration?: number]
    ): void

    protected flashSpecialEffect(
        xOrWidget: number | Widget,
        yOrDuration?: number,
        duration?: number
    ): void {
        if (typeof xOrWidget == "number") {
            Effect.flash(
                SPECIAL_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(this.ability, 0),
                xOrWidget,
                yOrDuration as number,
                duration
            )
        } else {
            Effect.flash(
                SPECIAL_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(this.ability, 0),
                xOrWidget,
                SPECIAL_EFFECT_ATTACHMENT_POINT_STRING_FIELD.getValue(this.ability),
                yOrDuration
            )
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onUnitGainAbility(_unit: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onUnitLoseAbility(_unit: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onCastingStart(caster: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onCastingFinish(caster: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onChannelingStart(caster: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onWidgetTargetChannelingStart(caster: Unit, target: Widget): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onUnitTargetChannelingStart(caster: Unit, target: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onItemTargetChannelingStart(caster: Unit, target: Item): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onDestructibleTargetChannelingStart(caster: Unit, target: Destructable): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onPointTargetChannelingStart(caster: Unit, x: number, y: number): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onNoTargetChannelingStart(caster: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onImpact(caster: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onWidgetTargetImpact(caster: Unit, target: Widget): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onUnitTargetImpact(caster: Unit, target: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onItemTargetImpact(caster: Unit, target: Item): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onDestructibleTargetImpact(caster: Unit, target: Destructable): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onPointTargetImpact(caster: Unit, x: number, y: number): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onNoTargetImpact(caster: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onChannelingFinish(caster: Unit): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onStop(caster: Unit): void {
        // no-op
    }

    public static bindAbilityType<Args extends any[]>(
        this: AbilityBehaviorConstructor<Args>,
        abilityTypeId: AbilityTypeId,
        ...args: Args
    ): void {
        let createBehaviorFunctions = createBehaviorFunctionsByAbilityTypeId.get(abilityTypeId)
        if (createBehaviorFunctions == undefined) {
            createBehaviorFunctions = []
            createBehaviorFunctionsByAbilityTypeId.set(abilityTypeId, createBehaviorFunctions)
        }
        createBehaviorFunctions[createBehaviorFunctions.length] = (ability) => {
            return new this(ability, ...args)
        }
    }

    static {
        type UnitEventHandlerParameters<T> = T extends (unit: Unit, ...args: infer P) => any
            ? P
            : never

        const createUnitEventListener: <K extends keyof AbilityBehavior>(
            key: K
        ) => EventListener<[Unit, Ability, ...UnitEventHandlerParameters<AbilityBehavior[K]>]> = (
            key
        ) => {
            return (unit, ability, ...args) => {
                AbilityBehavior.forAll<AbilityBehavior, [Ability], any>(ability, key, unit, ...args)
            }
        }

        const createZeroTimerUnitEventListener: <K extends keyof AbilityBehavior>(
            key: K
        ) => EventListener<[Unit, Ability, ...UnitEventHandlerParameters<AbilityBehavior[K]>]> = (
            key
        ) => {
            const unitEventListener = createUnitEventListener(key)
            return (unit, ability, ...args) => {
                Timer.run(unitEventListener, unit, ability, ...args)
            }
        }

        Unit.abilityGainedEvent.addListener(createUnitEventListener("onUnitGainAbility"))
        Unit.abilityLostEvent.addListener(createUnitEventListener("onUnitLoseAbility"))
        Unit.abilityCastingStartEvent.addListener(createUnitEventListener("onCastingStart"))
        Unit.abilityCastingFinishEvent.addListener(createUnitEventListener("onCastingFinish"))
        Unit.abilityChannelingStartEvent.addListener(createUnitEventListener("onChannelingStart"))
        Unit.abilityWidgetTargetChannelingStartEvent.addListener(
            createUnitEventListener("onWidgetTargetChannelingStart")
        )
        Unit.abilityUnitTargetChannelingStartEvent.addListener(
            createUnitEventListener("onUnitTargetChannelingStart")
        )
        Unit.abilityItemTargetChannelingStartEvent.addListener(
            createUnitEventListener("onItemTargetChannelingStart")
        )
        Unit.abilityDestructibleTargetChannelingStartEvent.addListener(
            createUnitEventListener("onDestructibleTargetChannelingStart")
        )
        Unit.abilityPointTargetChannelingStartEvent.addListener(
            createUnitEventListener("onPointTargetChannelingStart")
        )
        Unit.abilityNoTargetChannelingStartEvent.addListener(
            createUnitEventListener("onNoTargetChannelingStart")
        )
        Unit.abilityChannelingStartEvent.addListener(createZeroTimerUnitEventListener("onImpact"))
        Unit.abilityWidgetTargetChannelingStartEvent.addListener(
            createZeroTimerUnitEventListener("onWidgetTargetImpact")
        )
        Unit.abilityUnitTargetChannelingStartEvent.addListener(
            createZeroTimerUnitEventListener("onUnitTargetImpact")
        )
        Unit.abilityItemTargetChannelingStartEvent.addListener(
            createZeroTimerUnitEventListener("onItemTargetImpact")
        )
        Unit.abilityDestructibleTargetChannelingStartEvent.addListener(
            createZeroTimerUnitEventListener("onDestructibleTargetImpact")
        )
        Unit.abilityPointTargetChannelingStartEvent.addListener(
            createZeroTimerUnitEventListener("onPointTargetImpact")
        )
        Unit.abilityNoTargetChannelingStartEvent.addListener(
            createZeroTimerUnitEventListener("onNoTargetImpact")
        )
        Unit.abilityChannelingFinishEvent.addListener(createUnitEventListener("onChannelingFinish"))
        Unit.abilityStopEvent.addListener(createUnitEventListener("onStop"))
    }
}

Ability.onCreate.addListener((ability) => {
    const createBehaviorFunctions = createBehaviorFunctionsByAbilityTypeId.get(
        ability.typeId as AbilityTypeId
    )
    if (createBehaviorFunctions != undefined) {
        for (const createBehavior of createBehaviorFunctions) {
            createBehavior(ability)
        }
    }
})

Ability.destroyEvent.addListener((ability) => {
    AbilityBehavior.forAll(ability, "destroy")
})
