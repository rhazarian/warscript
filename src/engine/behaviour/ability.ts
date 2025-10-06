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
    CASTER_EFFECT_FIRST_ATTACHMENT_POINT_STRING_FIELD,
    CASTER_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
    EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
    MISSILE_ARC_ABILITY_FLOAT_FIELD,
    MISSILE_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
    MISSILE_SPEED_ABILITY_INTEGER_FIELD,
    SPECIAL_EFFECT_ATTACHMENT_POINT_STRING_FIELD,
    SPECIAL_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
    TARGET_EFFECT_FIRST_ATTACHMENT_POINT_STRING_FIELD,
    TARGET_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD,
} from "../standard/fields/ability"
import {
    AbilityDependentValue,
    AbilityField,
    AbilityLevelField,
    ReadonlySubscribableAbilityDependentValue,
    resolveCurrentAbilityDependentValue,
    SubscribableAbilityDependentValue,
} from "../object-field/ability"
import { Destructor } from "../../destroyable"

const createBehaviorFunctionsByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    ((ability: Ability) => AbilityBehavior)[]
>()

export type AbilityBehaviorConstructor<Args extends any[]> = new (
    ability: Ability,
    ...args: Args
) => AbilityBehavior

/*const invokeOnMissileArrival = <T extends any[]>(
    _missile: Missile,
    success: boolean,
    abilityBehavior: AbilityBehavior<{ periodicActionParameters: T }>,
    ...parameters: T
): void => {
    if (success) {
        abilityBehavior.onMissileArrival(...parameters)
    }
}*/

export type AbilityBehaviorParameters = {
    isExclusiveOnImpactHandler?: boolean
}

const exclusiveOnImpactHandlerAbilityBehaviorByAbility = setmetatable(
    new LuaMap<Ability, AbilityBehavior>(),
    { __mode: "k" },
)

type UnitEventHandlerParameters<T> = T extends (unit: Unit, ...args: infer P) => any ? P : never

const createUnitEventListener: <K extends keyof AbilityBehavior>(
    key: K,
) => EventListener<[Unit, Ability, ...UnitEventHandlerParameters<AbilityBehavior[K]>]> = (key) => {
    return (unit, ability, ...args) => {
        AbilityBehavior.forAll<AbilityBehavior, [Ability], any>(ability, key, unit, ...args)
    }
}

const registeredCommandEventIds = new LuaSet<string>()

const subscribedValuesByAbilityBehavior = new LuaMap<
    AbilityBehavior,
    LuaSet<SubscribableAbilityDependentValue<any>>
>()

export abstract class AbilityBehavior<
    Parameters extends {
        periodicActionParameters?: any[]
        missileParameters?: any[]
    } = {},
> extends Behavior<Ability, NonNullable<Parameters["periodicActionParameters"]>> {
    public constructor(ability: Ability, parameters?: AbilityBehaviorParameters) {
        super(ability)
        if (parameters?.isExclusiveOnImpactHandler) {
            exclusiveOnImpactHandlerAbilityBehaviorByAbility.set(ability, this)
        }
        this.onCreate()
    }

    protected override onDestroy(): Destructor {
        subscribedValuesByAbilityBehavior.delete(this)
        return super.onDestroy()
    }

    protected subscribe<T extends boolean | number | string>(
        value: SubscribableAbilityDependentValue<T>,
    ): void {
        if (value instanceof AbilityField || value instanceof AbilityLevelField) {
            let subscribedValues = subscribedValuesByAbilityBehavior.get(this)
            if (subscribedValues == undefined) {
                subscribedValues = new LuaSet()
                subscribedValuesByAbilityBehavior.set(this, subscribedValues)
            }
            subscribedValues.add(value)
        }
    }

    protected registerCommandEvent(
        orderTypeStringId: string = this.ability.orderTypeStringId,
    ): void {
        const commandEventId = `${this.ability.typeId}#${orderTypeStringId}`
        if (!registeredCommandEventIds.has(commandEventId)) {
            registeredCommandEventIds.add(commandEventId)
            Unit.abilityCommandEvent[this.ability.typeId][orderTypeStringId].addListener(
                createUnitEventListener("onCommand"),
            )
        }
    }

    public get ability(): Ability {
        return this.object
    }

    public get unit(): Unit | undefined {
        const owner = this.object.owner
        if (owner instanceof Unit) {
            return owner
        }
        return owner.owner
    }

    protected resolveCurrentAbilityDependentValue<T extends boolean | number | string>(
        value: AbilityDependentValue<T>,
    ): T
    protected resolveCurrentAbilityDependentValue<T extends boolean | number | string>(
        value?: AbilityDependentValue<T>,
    ): T | undefined

    protected resolveCurrentAbilityDependentValue<T extends boolean | number | string>(
        value?: AbilityDependentValue<T>,
    ): T | undefined {
        return resolveCurrentAbilityDependentValue(this.ability, value)
    }

    protected flashCasterEffect(
        widget: Widget,
        ...parametersOrDuration:
            | [parameters?: EffectParameters]
            | [duration?: number, parameters?: EffectParameters]
    ): void {
        const attachmentPoint = CASTER_EFFECT_FIRST_ATTACHMENT_POINT_STRING_FIELD.getValue(
            this.ability,
        )
        Effect.flash(
            CASTER_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(this.ability, 0),
            widget,
            attachmentPoint != "" ? attachmentPoint : "origin",
            ...parametersOrDuration,
        )
    }

    protected flashTargetEffect(
        widget: Widget,
        ...parametersOrDuration:
            | [parameters?: EffectParameters]
            | [duration?: number, parameters?: EffectParameters]
    ): void {
        const attachmentPoint = TARGET_EFFECT_FIRST_ATTACHMENT_POINT_STRING_FIELD.getValue(
            this.ability,
        )
        Effect.flash(
            TARGET_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(this.ability, 0),
            widget,
            attachmentPoint != "" ? attachmentPoint : "origin",
            ...parametersOrDuration,
        )
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
            ...parametersOrDuration,
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
            ...parametersOrDuration,
        )
    }

    protected flashSpecialEffect(
        ...args: [
            ...pointOrWidget: [x: number, y: number] | [widget: Widget],
            ...parametersOrDuration:
                | [parameters?: EffectParameters]
                | [duration?: number, parameters?: EffectParameters],
        ]
    ): void

    protected flashSpecialEffect(
        xOrWidget: number | Widget,
        yOrParametersOrDuration?: EffectParameters | number,
        durationOrParameters?: number | EffectParameters,
        parameters?: EffectParameters,
    ): void {
        if (typeof xOrWidget == "number") {
            Effect.flash(
                SPECIAL_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(this.ability, 0),
                xOrWidget,
                yOrParametersOrDuration as number,
                durationOrParameters as number,
                parameters,
            )
        } else {
            const attachmentPoint = SPECIAL_EFFECT_ATTACHMENT_POINT_STRING_FIELD.getValue(
                this.ability,
            )
            Effect.flash(
                SPECIAL_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(this.ability, 0),
                xOrWidget,
                attachmentPoint != "" ? attachmentPoint : "origin",
                yOrParametersOrDuration as number,
                durationOrParameters as EffectParameters,
            )
        }
    }

    private static MissileLaunchConfig = class {
        public constructor(private readonly abilityBehavior: AbilityBehavior) {}

        public get art(): string {
            return MISSILE_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD.getValue(
                this.abilityBehavior.ability,
                0,
            )
        }

        public get arc(): number {
            return MISSILE_ARC_ABILITY_FLOAT_FIELD.getValue(this.abilityBehavior.ability)
        }

        public get speed(): number {
            return MISSILE_SPEED_ABILITY_INTEGER_FIELD.getValue(this.abilityBehavior.ability)
        }
    }

    private get missileLaunchConfig(): InstanceType<typeof AbilityBehavior.MissileLaunchConfig> {
        const missileLaunchConfig = new AbilityBehavior.MissileLaunchConfig(this)
        rawset(this as any, "missileLaunchConfig", missileLaunchConfig)
        return missileLaunchConfig
    }

    /*protected launchMissile(
        source: Unit,
        ...args: [
            ...pointOrWidget: [x: number, y: number] | [widget: Widget],
            ...parameters: NonNullable<Parameters["missileParameters"]>
        ]
    ): void {
        Missile.launch(
            this.missileLaunchConfig,
            source,
            target,
            invokeOnMissileArrival,
            this,
            ...parameters
        )
    }*/

    protected onCreate(): void {
        // no-op
    }

    public onValueChange(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _value: ReadonlySubscribableAbilityDependentValue<string | number | boolean>,
    ): void {
        // no-op
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onMissileArrival(...parameters: NonNullable<Parameters["missileParameters"]>): void {
        // no-op
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
    public onCommand(caster: Unit, orderTypeStringId: string): void {
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
        Unit.abilityGainedEvent.addListener(createUnitEventListener("onUnitGainAbility"))
        Unit.abilityLostEvent.addListener(createUnitEventListener("onUnitLoseAbility"))
        Unit.abilityCastingStartEvent.addListener(createUnitEventListener("onCastingStart"))
        Unit.abilityCastingFinishEvent.addListener(createUnitEventListener("onCastingFinish"))
        Unit.abilityChannelingStartEvent.addListener(createUnitEventListener("onChannelingStart"))
        Unit.abilityWidgetTargetChannelingStartEvent.addListener(
            createUnitEventListener("onWidgetTargetChannelingStart"),
        )
        Unit.abilityUnitTargetChannelingStartEvent.addListener(
            createUnitEventListener("onUnitTargetChannelingStart"),
        )
        Unit.abilityItemTargetChannelingStartEvent.addListener(
            createUnitEventListener("onItemTargetChannelingStart"),
        )
        Unit.abilityDestructibleTargetChannelingStartEvent.addListener(
            createUnitEventListener("onDestructibleTargetChannelingStart"),
        )
        Unit.abilityPointTargetChannelingStartEvent.addListener(
            createUnitEventListener("onPointTargetChannelingStart"),
        )
        Unit.abilityNoTargetChannelingStartEvent.addListener(
            createUnitEventListener("onNoTargetChannelingStart"),
        )
        Unit.abilityImpactEvent.addListener(createUnitEventListener("onImpact"))
        Unit.abilityWidgetTargetImpactEvent.addListener(
            createUnitEventListener("onWidgetTargetImpact"),
        )
        Unit.abilityUnitTargetImpactEvent.addListener(createUnitEventListener("onUnitTargetImpact"))
        Unit.abilityItemTargetImpactEvent.addListener(createUnitEventListener("onItemTargetImpact"))
        Unit.abilityDestructibleTargetImpactEvent.addListener(
            createUnitEventListener("onDestructibleTargetImpact"),
        )
        Unit.abilityPointTargetImpactEvent.addListener(
            createUnitEventListener("onPointTargetImpact"),
        )
        Unit.abilityNoTargetImpactEvent.addListener(createUnitEventListener("onNoTargetImpact"))
        Unit.abilityChannelingFinishEvent.addListener(createUnitEventListener("onChannelingFinish"))
        Unit.abilityStopEvent.addListener(createUnitEventListener("onStop"))
    }
}

const checkBehaviorOnValueChange = (
    behavior: AbilityBehavior,
    field: ReadonlySubscribableAbilityDependentValue<boolean | number | string>,
) => {
    const subscribedValues = subscribedValuesByAbilityBehavior.get(behavior)
    if (subscribedValues != undefined && subscribedValues.has(field)) {
        behavior.onValueChange(field)
    }
}

AbilityField.valueChangeEvent.addListener((ability, field) => {
    AbilityBehavior.forAll(ability, checkBehaviorOnValueChange, field)
})

AbilityLevelField.valueChangeEvent.addListener((ability, field) => {
    AbilityBehavior.forAll(ability, checkBehaviorOnValueChange, field)
})

Ability.onCreate.addListener((ability) => {
    const createBehaviorFunctions = createBehaviorFunctionsByAbilityTypeId.get(ability.typeId)
    if (createBehaviorFunctions != undefined) {
        for (const createBehavior of createBehaviorFunctions) {
            createBehavior(ability)
        }
    }
})

Ability.destroyEvent.addListener((ability) => {
    AbilityBehavior.forAll(ability, "destroy")
})
