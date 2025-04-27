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
    protected readonly applyBuff: (this: void, unit: Unit) => InstanceType<T> | undefined

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
        if (typeof constructorOrTypeIdOrTypeIds == "number") {
            this.applyBuff = ((unit: Unit) => {
                return Buff.apply(
                    unit,
                    constructorOrTypeIdOrTypeIds,
                    typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy as BuffPolarityParameterType,
                    polarityOrTypeIdSelectionPolicyOrResistanceType as BuffResistanceTypeParameterType,
                    ability,
                    resistanceTypeOrPolarityOrParameters as BuffParametersType<T> | undefined,
                )
            }) as (unit: Unit) => InstanceType<T>
        } else if (Array.isArray(constructorOrTypeIdOrTypeIds)) {
            this.applyBuff = ((unit: Unit) => {
                return Buff.apply(
                    unit,
                    constructorOrTypeIdOrTypeIds as ReadonlyNonEmptyArray<ApplicableBuffTypeId>,
                    typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy as BuffTypeIdSelectionPolicy,
                    polarityOrTypeIdSelectionPolicyOrResistanceType as BuffPolarityParameterType,
                    resistanceTypeOrPolarityOrParameters as BuffResistanceTypeParameterType,
                    ability,
                    parametersOrResistanceType as BuffParametersType<T> | undefined,
                )
            }) as (unit: Unit) => InstanceType<T>
        } else if (typeof typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy == "number") {
            this.applyBuff = ((unit: Unit) => {
                return (constructorOrTypeIdOrTypeIds as BuffConstructor as typeof Buff).apply(
                    unit,
                    typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy as ApplicableBuffTypeId,
                    polarityOrTypeIdSelectionPolicyOrResistanceType as BuffPolarityParameterType,
                    resistanceTypeOrPolarityOrParameters as BuffResistanceTypeParameterType,
                    ability,
                    parametersOrResistanceType as BuffParametersType<T> | undefined,
                )
            }) as (unit: Unit) => InstanceType<T>
        } else {
            this.applyBuff = ((unit: Unit) => {
                return (constructorOrTypeIdOrTypeIds as BuffConstructor as typeof Buff).apply(
                    unit,
                    typeIdOrTypeIdsOrPolarityOrTypeIdSelectionPolicy as ReadonlyNonEmptyArray<ApplicableBuffTypeId>,
                    polarityOrTypeIdSelectionPolicyOrResistanceType as BuffTypeIdSelectionPolicy,
                    resistanceTypeOrPolarityOrParameters as BuffPolarityParameterType,
                    parametersOrResistanceType as BuffResistanceTypeParameterType,
                    ability,
                    parameters,
                )
            }) as (unit: Unit) => InstanceType<T>
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
        for (const unit of Unit.getAllowedTargetsInCollisionRange(
            caster,
            resolveCurrentAbilityDependentValue(
                this.ability,
                ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
            caster.x,
            caster.y,
            resolveCurrentAbilityDependentValue(
                this.ability,
                AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
            ),
        )) {
            this.applyBuff(unit)
        }
    }
}

export class ApplyBuffTargetAreaAbilityBehavior<
    T extends BuffConstructor = typeof Buff,
> extends ApplyBuffAbilityBehavior<T> {
    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        for (const unit of Unit.getAllowedTargetsInCollisionRange(
            caster,
            resolveCurrentAbilityDependentValue(
                this.ability,
                ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
            x,
            y,
            resolveCurrentAbilityDependentValue(
                this.ability,
                AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
            ),
        )) {
            this.applyBuff(unit)
        }
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        for (const unit of Unit.getAllowedTargetsInCollisionRange(
            caster,
            resolveCurrentAbilityDependentValue(
                this.ability,
                ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
            target.x,
            target.y,
            resolveCurrentAbilityDependentValue(
                this.ability,
                AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
            ),
        )) {
            this.applyBuff(unit)
        }
    }
}
