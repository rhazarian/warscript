import { AbilityBehavior } from "../ability"
import { Ability } from "../../internal/ability"
import { UnitBehavior } from "../unit"
import { Unit } from "../../internal/unit"
import { MutableKeys } from "../../../utility/types"
import { AbilityDependentValue, AbilityField, AbilityLevelField } from "../../object-field/ability"

type UnitBehaviorParameters<T extends UnitBehavior> = Partial<{
    [K in MutableKeys<T> & KeysOfType<T, boolean | number | string>]: T[K] extends
        | boolean
        | number
        | string
        ? AbilityDependentValue<T[K]>
        : never
}>

export class ApplyUnitBehaviorAbilityBehavior<T extends UnitBehavior> extends AbilityBehavior {
    private readonly keys?: (keyof UnitBehaviorParameters<T>)[]

    private unitBehavior?: T

    public constructor(
        ability: Ability,
        private readonly unitBehaviorConstructor: new (unit: Unit) => T,
        private readonly parameters?: UnitBehaviorParameters<T>
    ) {
        super(ability)
        if (parameters != undefined) {
            this.keys = Object.keys(parameters).sort() as (keyof UnitBehaviorParameters<T>)[]
        }
    }

    public update(): void {
        const unitBehavior = this.unitBehavior
        const parameters = this.parameters
        const keys = this.keys
        if (unitBehavior != undefined && parameters != undefined && keys != undefined) {
            for (const key of keys) {
                const value = parameters[key]
                if (value != undefined) {
                    unitBehavior[key] = this.resolveCurrentAbilityDependentValue(value)
                }
            }
        }
    }

    public override onUnitGainAbility(unit: Unit): void {
        this.unitBehavior?.destroy()
        this.unitBehavior = new this.unitBehaviorConstructor(unit)
        this.update()
    }

    public override onUnitLoseAbility(): void {
        this.unitBehavior?.destroy()
    }
}

AbilityField.valueChangeEvent.addListener((ability) => {
    ApplyUnitBehaviorAbilityBehavior.forAll(ability, "update")
})

AbilityLevelField.valueChangeEvent.addListener((ability) => {
    ApplyUnitBehaviorAbilityBehavior.forAll(ability, "update")
})
