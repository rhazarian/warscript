import { AbilityBehavior } from "../ability"
import { Ability } from "../../internal/ability"
import { UnitBehavior, UnitBehaviorConstructor } from "../unit"
import { Unit } from "../../internal/unit"

export class ApplyUnitBehaviorAbilityBehavior<Args extends any[]> extends AbilityBehavior {
    private readonly createUnitBehavior: (unit: Unit) => UnitBehavior

    private unitBehavior?: UnitBehavior

    public constructor(
        ability: Ability,
        unitBehaviorConstructor: UnitBehaviorConstructor<Args>,
        ...args: Args
    ) {
        super(ability)
        this.createUnitBehavior = (unit) => {
            return new unitBehaviorConstructor(unit, ...args)
        }
    }

    public override onUnitGainAbility(unit: Unit): void {
        this.unitBehavior?.destroy()
        this.unitBehavior = this.createUnitBehavior(unit)
    }

    public override onUnitLoseAbility(): void {
        this.unitBehavior?.destroy()
    }
}
