import { Widget } from "../../../core/types/widget"
import { Ability } from "../../internal/ability"
import { Unit } from "../../internal/unit"
import { AbilityDependentValue } from "../../object-field/ability"
import { AbilityBehavior } from "../ability"
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

    protected healArea(caster: Unit, x: number, y: number): void {
        const targets = Unit.getAllowedTargetsInCollisionRange(
            caster,
            this.resolveCurrentAbilityDependentValue(
                ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
            x,
            y,
            this.resolveCurrentAbilityDependentValue(AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD),
        )

        let healing = this.calculateHealing(caster)
        const maximumHealing = this.resolveCurrentAbilityDependentValue(
            this.parameters?.maximumHealing ?? 0,
        )
        if (maximumHealing != 0 && healing > maximumHealing) {
            healing = maximumHealing / targets.length
        }

        for (const target of targets) {
            caster.healTarget(target, healing)
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
