import { Ability } from "../../internal/ability"
import { Unit } from "../../internal/unit"
import { AbilityDependentValue } from "../../object-field/ability"
import { AbilityBehavior } from "../ability"
import { Widget } from "../../../core/types/widget"

abstract class RestoreManaAbilityBehavior extends AbilityBehavior {
    protected constructor(
        ability: Ability,
        private readonly mana: AbilityDependentValue<number>,
    ) {
        super(ability)
    }

    /** Resolves the amount of mana as it would be restored right now. */
    protected resolveMana(): number {
        return this.resolveCurrentAbilityDependentValue(this.mana)
    }
}

export class RestoreManaSelfAbilityBehavior extends RestoreManaAbilityBehavior {
    public constructor(ability: Ability, mana: AbilityDependentValue<number>) {
        super(ability, mana)
    }

    public override onImpact(caster: Unit): void {
        caster.mana += this.resolveMana()
    }
}

export class RestoreManaTargetAbilityBehavior extends RestoreManaAbilityBehavior {
    public constructor(ability: Ability, mana: AbilityDependentValue<number>) {
        super(ability, mana)
    }

    public override onUnitTargetImpact(caster: Unit, target: Unit): void {
        target.mana += this.resolveMana()
    }
}

// === On missile impact ===
//
// The same behaviors, except that an impact launches the missile of the ability at the target of
// the cast and the mana is only restored once the missile arrives. The amount is resolved when
// the missile is launched, so the ability (its level, its fields, or whether the caster still has
// it) does not matter by the time it lands. A cast without a target has nothing to launch at and
// takes effect right away.

export class OnMissileImpactRestoreManaSelfAbilityBehavior extends RestoreManaAbilityBehavior {
    public constructor(ability: Ability, mana: AbilityDependentValue<number>) {
        super(ability, mana)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const mana = this.resolveMana()
        this.onMissileImpact(caster, target, () => {
            caster.mana += mana
        })
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const mana = this.resolveMana()
        this.onMissileImpact(caster, x, y, () => {
            caster.mana += mana
        })
    }

    public override onNoTargetImpact(caster: Unit): void {
        caster.mana += this.resolveMana()
    }
}

export class OnMissileImpactRestoreManaTargetAbilityBehavior extends RestoreManaAbilityBehavior {
    public constructor(ability: Ability, mana: AbilityDependentValue<number>) {
        super(ability, mana)
    }

    public override onUnitTargetImpact(caster: Unit, target: Unit): void {
        const mana = this.resolveMana()
        this.onMissileImpact(caster, target, () => {
            target.mana += mana
        })
    }
}
