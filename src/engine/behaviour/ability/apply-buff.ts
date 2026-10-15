import { AbilityBehavior } from "../ability"
import { Ability } from "../../internal/ability"
import {
    Buff,
    BuffConstructor,
    BuffParameters,
    BuffPolarityParameterType,
    BuffResistanceTypeParameterType,
    BuffTypeIdSelectionPolicy,
} from "../../buff"
import { Unit } from "../../internal/unit"
import { ApplicableBuffTypeId } from "../../object-data/entry/buff-type/applicable"
import { Widget } from "../../../core/types/widget"
import { resolveCurrentAbilityDependentValue } from "../../object-field/ability"
import {
    ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
    AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
} from "../../standard/fields/ability"
import { ReadonlyNonEmptyArray } from "../../../utility/types"

type BuffParametersType<T extends BuffConstructor> = BuffParameters &
    Omit<BuffAdditionalParametersType<T>, keyof BuffParameters>

type BuffAdditionalParametersType<T extends BuffConstructor> =
    T extends BuffConstructor<Buff<infer AdditionalParameters>> ? AdditionalParameters : never

export abstract class ApplyBuffAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends AbilityBehavior {
    /**
     * Applies the buff to the unit. The buff takes its level, duration, etc. from the ability of
     * the behavior, unless another ability (such as a snapshot of it) is given.
     */
    protected readonly applyBuff: (
        this: void,
        unit: Unit,
        ability?: Ability,
    ) => InstanceType<T> | undefined

    public constructor(
        ability: Ability,
        ...parameters: [
            ...constructor: [] | [T],
            ...typeId:
                | [ApplicableBuffTypeId]
                | [
                      typeIds: [ApplicableBuffTypeId, ...ApplicableBuffTypeId[]],
                      typeIdSelectionPolicy: BuffTypeIdSelectionPolicy,
                  ],
            polarity: BuffPolarityParameterType,
            resistanceType: BuffResistanceTypeParameterType,
            parameters?: BuffParametersType<T>,
        ]
    )

    public constructor(
        ability: Ability,
        constructorOrTypeIdOrTypeIds:
            | T
            | ApplicableBuffTypeId
            | ReadonlyNonEmptyArray<ApplicableBuffTypeId>,
        typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy:
            | ApplicableBuffTypeId
            | ReadonlyNonEmptyArray<ApplicableBuffTypeId>
            | BuffPolarityParameterType
            | BuffTypeIdSelectionPolicy,
        polarityOrTypeIdSelectionPolicyOrResistanceType:
            | BuffPolarityParameterType
            | BuffTypeIdSelectionPolicy
            | BuffResistanceTypeParameterType,
        resistanceTypeOrPolarityOrParameters?:
            | BuffResistanceTypeParameterType
            | BuffPolarityParameterType
            | BuffParametersType<T>,
        parametersOrResistanceType?: BuffParametersType<T> | BuffResistanceTypeParameterType,
        parameters?: BuffParametersType<T>,
    ) {
        super(ability)
        let apply: (this: void, unit: Unit, ability: Ability | AbilityBehavior) => Buff | undefined
        if (typeof constructorOrTypeIdOrTypeIds == "number") {
            apply = (unit, ability) => {
                return Buff.apply(
                    unit,
                    constructorOrTypeIdOrTypeIds,
                    typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy as BuffPolarityParameterType,
                    polarityOrTypeIdSelectionPolicyOrResistanceType as BuffResistanceTypeParameterType,
                    ability,
                    resistanceTypeOrPolarityOrParameters as BuffParametersType<T> | undefined,
                )
            }
        } else if (Array.isArray(constructorOrTypeIdOrTypeIds)) {
            apply = (unit, ability) => {
                return Buff.apply(
                    unit,
                    constructorOrTypeIdOrTypeIds as ReadonlyNonEmptyArray<ApplicableBuffTypeId>,
                    typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy as BuffTypeIdSelectionPolicy,
                    polarityOrTypeIdSelectionPolicyOrResistanceType as BuffPolarityParameterType,
                    resistanceTypeOrPolarityOrParameters as BuffResistanceTypeParameterType,
                    ability,
                    parametersOrResistanceType as BuffParametersType<T> | undefined,
                )
            }
        } else if (typeof typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy == "number") {
            apply = (unit, ability) => {
                return (constructorOrTypeIdOrTypeIds as BuffConstructor as typeof Buff).apply(
                    unit,
                    typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy as ApplicableBuffTypeId,
                    polarityOrTypeIdSelectionPolicyOrResistanceType as BuffPolarityParameterType,
                    resistanceTypeOrPolarityOrParameters as BuffResistanceTypeParameterType,
                    ability,
                    parametersOrResistanceType as BuffParametersType<T> | undefined,
                )
            }
        } else {
            apply = (unit, ability) => {
                return (constructorOrTypeIdOrTypeIds as BuffConstructor as typeof Buff).apply(
                    unit,
                    typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy as ReadonlyNonEmptyArray<ApplicableBuffTypeId>,
                    polarityOrTypeIdSelectionPolicyOrResistanceType as BuffTypeIdSelectionPolicy,
                    resistanceTypeOrPolarityOrParameters as BuffPolarityParameterType,
                    parametersOrResistanceType as BuffResistanceTypeParameterType,
                    ability,
                    parameters,
                )
            }
        }
        this.applyBuff = ((unit: Unit, ability?: Ability) => {
            if (ability == undefined) {
                return apply(unit, this)
            }
            // The buff is still the behavior's, whatever ability it was resolved against.
            const buff = apply(unit, ability)
            if (buff != undefined) {
                ;(
                    buff as { sourceAbilityBehavior: Buff["sourceAbilityBehavior"] }
                ).sourceAbilityBehavior = this
            }
            return buff
        }) as (unit: Unit, ability?: Ability) => InstanceType<T>
    }

    /**
     * Applies the buff to every allowed target around the point, as per the area of effect and
     * the allowed targets of the ability (or of the given ability, such as a snapshot of it).
     */
    protected applyBuffArea(caster: Unit, x: number, y: number, ability?: Ability): void {
        for (const unit of Unit.getAllowedTargetsInCollisionRange(
            caster,
            resolveCurrentAbilityDependentValue(
                ability ?? this.ability,
                ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
            x,
            y,
            resolveCurrentAbilityDependentValue(
                ability ?? this.ability,
                AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
            ),
        )) {
            this.applyBuff(unit, ability)
        }
    }
}

export class ApplyBuffSelfAbilityBehaviour<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onImpact(caster: Unit): void {
        this.applyBuff(caster)
    }
}

export class ApplyBuffTargetAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onUnitTargetImpact(caster: Unit, target: Unit): void {
        this.applyBuff(target)
    }
}

export class ApplyBuffSelfAreaAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onImpact(caster: Unit): void {
        this.applyBuffArea(caster, caster.x, caster.y)
    }
}

export class ApplyBuffTargetAreaAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        this.applyBuffArea(caster, x, y)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        this.applyBuffArea(caster, target.x, target.y)
    }
}

const behaviorByBuff = new LuaMap<Buff, ApplyBuffChannelingTargetAbilityBehavior<any>>()

export class ApplyBuffChannelingTargetAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    private buff?: InstanceType<T>

    public override onUnitTargetChannelingStart(caster: Unit, target: Unit): void {
        const previousBuff = this.buff
        if (previousBuff !== undefined) {
            behaviorByBuff.delete(previousBuff)
            previousBuff.destroy()
        }
        const buff = this.applyBuff(target)
        if (buff != undefined) {
            behaviorByBuff.set(buff, this)
        }
        this.buff = buff
    }

    public override onStop(): void {
        const buff = this.buff
        if (buff !== undefined) {
            behaviorByBuff.delete(buff)
            buff.destroy()
            this.buff = undefined
        }
    }
}

Buff.beingDestroyedEvent.addListener((buff) => {
    const behavior = behaviorByBuff.get(buff)
    if (behavior !== undefined) {
        behaviorByBuff.delete(buff)
        behavior.ability.interruptCast()
    }
})

// === On missile impact ===
//
// The same behaviors, except that an impact launches the missile of the ability at the target of
// the cast and the buff is only applied once the missile arrives. The buff is resolved against a
// snapshot of the ability taken when the missile is launched, so neither the ability's level and
// fields at the time of arrival nor whether the caster still has it matter. A cast without a
// target has nothing to launch at and takes effect right away.

export class OnMissileImpactApplyBuffSelfAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const ability = this.ability.getSnapshot()
        this.onMissileImpact(caster, target, () => this.applyBuff(caster, ability))
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const ability = this.ability.getSnapshot()
        this.onMissileImpact(caster, x, y, () => this.applyBuff(caster, ability))
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.applyBuff(caster)
    }
}

export class OnMissileImpactApplyBuffTargetAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onUnitTargetImpact(caster: Unit, target: Unit): void {
        const ability = this.ability.getSnapshot()
        this.onMissileImpact(caster, target, () => this.applyBuff(target, ability))
    }
}

export class OnMissileImpactApplyBuffSelfAreaAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const ability = this.ability.getSnapshot()
        this.onMissileImpact(caster, target, () =>
            this.applyBuffArea(caster, caster.x, caster.y, ability),
        )
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const ability = this.ability.getSnapshot()
        this.onMissileImpact(caster, x, y, () =>
            this.applyBuffArea(caster, caster.x, caster.y, ability),
        )
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.applyBuffArea(caster, caster.x, caster.y)
    }
}

export class OnMissileImpactApplyBuffTargetAreaAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const ability = this.ability.getSnapshot()
        this.onMissileImpact(caster, target, () =>
            this.applyBuffArea(caster, target.x, target.y, ability),
        )
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const ability = this.ability.getSnapshot()
        this.onMissileImpact(caster, x, y, () => this.applyBuffArea(caster, x, y, ability))
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.applyBuffArea(caster, caster.x, caster.y)
    }
}
