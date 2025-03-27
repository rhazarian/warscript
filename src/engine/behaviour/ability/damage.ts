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

export class DamageSelfAbilityBehavior extends AbilityBehavior {
    public constructor(
        ability: Ability,
        private readonly damage: AbilityDependentValue<number>,
        private readonly attackType?: AttackType,
        private readonly damageType?: DamageType,
        private readonly weaponType?: WeaponType,
    ) {
        super(ability)
    }

    public override onImpact(caster: Unit): void {
        caster.damageTarget(
            caster,
            this.resolveCurrentAbilityDependentValue(this.damage),
            undefined,
            undefined,
            this.attackType,
            this.damageType,
            this.weaponType,
        )
    }
}

export class DamageTargetAbilityBehavior extends AbilityBehavior {
    public constructor(
        ability: Ability,
        private readonly damage: AbilityDependentValue<number>,
        private readonly attackType?: AttackType,
        private readonly damageType?: DamageType,
        private readonly weaponType?: WeaponType,
    ) {
        super(ability)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        caster.damageTarget(
            target,
            this.resolveCurrentAbilityDependentValue(this.damage),
            undefined,
            undefined,
            this.attackType,
            this.damageType,
            this.weaponType,
        )
    }
}

abstract class DamageAreaAbilityBehavior extends AbilityBehavior {
    protected constructor(
        ability: Ability,
        private readonly damage: AbilityDependentValue<number>,
        private readonly maximumDamage?: AbilityDependentValue<number>,
        private readonly attackType?: AttackType,
        private readonly damageType?: DamageType,
        private readonly weaponType?: WeaponType,
    ) {
        super(ability)
    }

    protected damageArea(caster: Unit, x: number, y: number): void {
        const targets = Unit.getAllowedTargetsInCollisionRange(
            caster,
            this.resolveCurrentAbilityDependentValue(
                ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
            x,
            y,
            this.resolveCurrentAbilityDependentValue(AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD),
        )

        let damage = this.resolveCurrentAbilityDependentValue(this.damage)
        const maximumDamage = this.resolveCurrentAbilityDependentValue(this.maximumDamage ?? 0)
        if (maximumDamage != 0 && damage > maximumDamage) {
            damage = maximumDamage / targets.length
        }

        for (const target of targets) {
            caster.damageTarget(
                target,
                damage,
                undefined,
                undefined,
                this.attackType,
                this.damageType,
                this.weaponType,
            )
        }
    }
}

export class DamageSelfAreaAbilityBehavior extends DamageAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        maximumDamage?: AbilityDependentValue<number>,
        attackType?: AttackType,
        damageType?: DamageType,
        weaponType?: WeaponType,
    ) {
        super(ability, damage, maximumDamage, attackType, damageType, weaponType)
    }

    public override onImpact(caster: Unit) {
        this.damageArea(caster, caster.x, caster.y)
    }
}

export class DamageTargetAreaAbilityBehavior extends DamageAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        maximumDamage?: AbilityDependentValue<number>,
        attackType?: AttackType,
        damageType?: DamageType,
        weaponType?: WeaponType,
    ) {
        super(ability, damage, maximumDamage, attackType, damageType, weaponType)
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
