import { Widget } from "../../../core/types/widget"
import { Ability } from "../../internal/ability"
import { Unit } from "../../internal/unit"
import { AbilityDependentValue } from "../../object-field/ability"
import { AbilityBehavior } from "../ability"
import { CombatClassifications } from "../../object-data/auxiliary/combat-classification"
import {
    ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
    AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
} from "../../standard/fields/ability"

export type HealAbilityBehaviorParameters = {
    healingPerStrength?: AbilityDependentValue<number>
    healingPerAgility?: AbilityDependentValue<number>
    healingPerIntelligence?: AbilityDependentValue<number>
}

export type HealAreaAbilityBehaviorParameters = HealAbilityBehaviorParameters & {
    maximumHealing?: AbilityDependentValue<number>
}

/** The area healing of a behavior with everything it depends on resolved, ready to be done. */
export type ResolvedAreaHealing = {
    readonly amount: number
    readonly maximumHealing: number
    readonly range: number
    readonly allowedTargetCombatClassifications: CombatClassifications
}

abstract class HealAbilityBehavior<
    T extends HealAbilityBehaviorParameters = HealAbilityBehaviorParameters,
> extends AbilityBehavior {
    protected constructor(
        ability: Ability,
        protected readonly healing: AbilityDependentValue<number>,
        protected readonly parameters?: T,
    ) {
        super(ability)
    }

    protected calculateHealing(caster: Unit): number {
        const parameters = this.parameters
        let healing = this.resolveCurrentAbilityDependentValue(this.healing)
        const healingPerStrength = this.resolveCurrentAbilityDependentValue(
            parameters?.healingPerStrength ?? 0,
        )
        if (healingPerStrength != 0) {
            healing += healingPerStrength * caster.strength
        }
        const healingPerAgility = this.resolveCurrentAbilityDependentValue(
            parameters?.healingPerAgility ?? 0,
        )
        if (healingPerAgility != 0) {
            healing += healingPerAgility * caster.agility
        }
        const healingPerIntelligence = this.resolveCurrentAbilityDependentValue(
            parameters?.healingPerIntelligence ?? 0,
        )
        if (healingPerIntelligence != 0) {
            healing += healingPerIntelligence * caster.intelligence
        }
        return healing
    }
}

export class HealSelfAbilityBehavior extends HealAbilityBehavior {
    public constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    public override onImpact(caster: Unit): void {
        caster.healTarget(caster, this.calculateHealing(caster))
    }
}

export class HealTargetAbilityBehavior extends HealAbilityBehavior {
    public constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        caster.healTarget(target, this.calculateHealing(caster))
    }
}

abstract class HealAreaAbilityBehavior extends HealAbilityBehavior<HealAreaAbilityBehaviorParameters> {
    protected constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAreaAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    /** Resolves the area healing as it would be done right now. */
    protected resolveAreaHealing(caster: Unit): ResolvedAreaHealing {
        return {
            amount: this.calculateHealing(caster),
            maximumHealing: this.resolveCurrentAbilityDependentValue(
                this.parameters?.maximumHealing ?? 0,
            ),
            range: this.resolveCurrentAbilityDependentValue(
                AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
            ),
            allowedTargetCombatClassifications: this.resolveCurrentAbilityDependentValue(
                ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
        }
    }

    protected healArea(
        caster: Unit,
        x: number,
        y: number,
        healing: ResolvedAreaHealing = this.resolveAreaHealing(caster),
    ): void {
        const targets = Unit.getAllowedTargetsInCollisionRange(
            caster,
            healing.allowedTargetCombatClassifications,
            x,
            y,
            healing.range,
        )

        let amount = healing.amount
        const maximumHealing = healing.maximumHealing
        if (maximumHealing != 0 && amount > maximumHealing) {
            amount = maximumHealing / targets.length
        }

        for (const target of targets) {
            caster.healTarget(target, amount)
        }
    }
}

export class HealSelfAreaAbilityBehavior extends HealAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAreaAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    public override onImpact(caster: Unit) {
        this.healArea(caster, caster.x, caster.y)
    }
}

export class HealTargetAreaAbilityBehavior extends HealAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAreaAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    public override onNoTargetImpact(caster: Unit) {
        this.healArea(caster, caster.x, caster.y)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        this.healArea(caster, target.x, target.y)
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        this.healArea(caster, x, y)
    }
}

// === On missile impact ===
//
// The same behaviors, except that an impact launches the missile of the ability at the target of
// the cast and the healing is only done once the missile arrives. The healing is resolved when
// the missile is launched, so neither the caster's stats nor the ability (its level, its fields,
// or whether the caster still has it) matter by the time it lands. A cast without a target has
// nothing to launch at and takes effect right away.

export class OnMissileImpactHealSelfAbilityBehavior extends HealAbilityBehavior {
    public constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const healing = this.calculateHealing(caster)
        this.onMissileImpact(caster, target, () => caster.healTarget(caster, healing))
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const healing = this.calculateHealing(caster)
        this.onMissileImpact(caster, x, y, () => caster.healTarget(caster, healing))
    }

    public override onNoTargetImpact(caster: Unit): void {
        caster.healTarget(caster, this.calculateHealing(caster))
    }
}

export class OnMissileImpactHealTargetAbilityBehavior extends HealAbilityBehavior {
    public constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const healing = this.calculateHealing(caster)
        this.onMissileImpact(caster, target, () => caster.healTarget(target, healing))
    }
}

export class OnMissileImpactHealSelfAreaAbilityBehavior extends HealAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAreaAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const healing = this.resolveAreaHealing(caster)
        this.onMissileImpact(caster, target, () =>
            this.healArea(caster, caster.x, caster.y, healing),
        )
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const healing = this.resolveAreaHealing(caster)
        this.onMissileImpact(caster, x, y, () => this.healArea(caster, caster.x, caster.y, healing))
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.healArea(caster, caster.x, caster.y)
    }
}

export class OnMissileImpactHealTargetAreaAbilityBehavior extends HealAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        healing: AbilityDependentValue<number>,
        parameters?: HealAreaAbilityBehaviorParameters,
    ) {
        super(ability, healing, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const healing = this.resolveAreaHealing(caster)
        this.onMissileImpact(caster, target, () =>
            this.healArea(caster, target.x, target.y, healing),
        )
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const healing = this.resolveAreaHealing(caster)
        this.onMissileImpact(caster, x, y, () => this.healArea(caster, x, y, healing))
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.healArea(caster, caster.x, caster.y)
    }
}
