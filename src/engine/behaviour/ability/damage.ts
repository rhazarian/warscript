import { AbilityBehavior } from "../ability"
import { Ability } from "../../internal/ability"
import { Unit } from "../../internal/unit"
import { AbilityDependentValue } from "../../object-field/ability"
import { Widget } from "../../../core/types/widget"
import {
    ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
    AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
} from "../../standard/fields/ability"
import { AttackType, DamageType, WeaponType } from "../../internal/unit+damage"

export type DamageAbilityBehaviorParameters = {
    damagePerStrength?: AbilityDependentValue<number>
    damagePerAgility?: AbilityDependentValue<number>
    damagePerIntelligence?: AbilityDependentValue<number>
    attackType?: AttackType
    damageType?: DamageType
    weaponType?: WeaponType
}

export type DamageAreaAbilityBehaviorParameters = DamageAbilityBehaviorParameters & {
    maximumDamage?: AbilityDependentValue<number>
}

abstract class DamageAbilityBehavior<
    T extends DamageAbilityBehaviorParameters = DamageAbilityBehaviorParameters,
> extends AbilityBehavior {
    protected constructor(
        ability: Ability,
        protected readonly damage: AbilityDependentValue<number>,
        protected readonly parameters?: T,
    ) {
        super(ability)
    }

    protected calculateDamage(caster: Unit): number {
        const parameters = this.parameters
        let damage = this.resolveCurrentAbilityDependentValue(this.damage)
        const damagePerStrength = this.resolveCurrentAbilityDependentValue(
            parameters?.damagePerStrength ?? 0,
        )
        if (damagePerStrength != 0) {
            damage += damagePerStrength * caster.strength
        }
        const damagePerAgility = this.resolveCurrentAbilityDependentValue(
            parameters?.damagePerAgility ?? 0,
        )
        if (damagePerAgility != 0) {
            damage += damagePerAgility * caster.agility
        }
        const damagePerIntelligence = this.resolveCurrentAbilityDependentValue(
            parameters?.damagePerIntelligence ?? 0,
        )
        if (damagePerIntelligence != 0) {
            damage += damagePerIntelligence * caster.intelligence
        }
        return damage
    }
}

export class DamageSelfAbilityBehavior extends DamageAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    public override onImpact(caster: Unit): void {
        const parameters = this.parameters
        caster.damageTarget(
            caster,
            this.calculateDamage(caster),
            undefined,
            undefined,
            parameters?.attackType,
            parameters?.damageType,
            parameters?.weaponType,
        )
    }
}

export class DamageTargetAbilityBehavior extends DamageAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const parameters = this.parameters
        caster.damageTarget(
            target,
            this.calculateDamage(caster),
            undefined,
            undefined,
            parameters?.attackType,
            parameters?.damageType,
            parameters?.weaponType,
        )
    }
}

abstract class DamageAreaAbilityBehavior extends DamageAbilityBehavior<DamageAreaAbilityBehaviorParameters> {
    protected constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAreaAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    protected damageArea(caster: Unit, x: number, y: number): void {
        const parameters = this.parameters

        const targets = Unit.getAllowedTargetsInCollisionRange(
            caster,
            this.resolveCurrentAbilityDependentValue(
                ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
            x,
            y,
            this.resolveCurrentAbilityDependentValue(AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD),
        )

        let damage = this.calculateDamage(caster)
        const maximumDamage = this.resolveCurrentAbilityDependentValue(
            parameters?.maximumDamage ?? 0,
        )
        if (maximumDamage != 0 && damage > maximumDamage) {
            damage = maximumDamage / targets.length
        }

        for (const target of targets) {
            caster.damageTarget(
                target,
                damage,
                undefined,
                undefined,
                parameters?.attackType,
                parameters?.damageType,
                parameters?.weaponType,
            )
        }
    }
}

export class DamageSelfAreaAbilityBehavior extends DamageAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAreaAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    public override onImpact(caster: Unit) {
        this.damageArea(caster, caster.x, caster.y)
    }
}

export class DamageTargetAreaAbilityBehavior extends DamageAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAreaAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    public override onNoTargetImpact(caster: Unit) {
        this.damageArea(caster, caster.x, caster.y)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        this.damageArea(caster, target.x, target.y)
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        this.damageArea(caster, x, y)
    }
}
