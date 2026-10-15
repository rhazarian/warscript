import { AbilityBehavior } from "../ability"
import { Ability } from "../../internal/ability"
import { Unit } from "../../internal/unit"
import { AbilityDependentValue } from "../../object-field/ability"
import { Widget } from "../../../core/types/widget"
import {
    ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
    AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
} from "../../standard/fields/ability"
import { DamageType } from "../../internal/unit+damage"
import "../../internal/unit+damage"
import { CombatClassifications } from "../../object-data/auxiliary/combat-classification"
import { AttackType } from "../../object-data/auxiliary/attack-type"
import { WeaponSoundType } from "../../object-data/auxiliary/weapon-sound-type"

export type DamageAbilityBehaviorParameters = {
    damagePerStrength?: AbilityDependentValue<number>
    damagePerAgility?: AbilityDependentValue<number>
    damagePerIntelligence?: AbilityDependentValue<number>
    attackType?: AbilityDependentValue<AttackType>
    damageType?: DamageType
    weaponSoundType?: WeaponSoundType
    metadata?: AbilityDependentValue<string | number | boolean>
}

export type DamageAreaAbilityBehaviorParameters = DamageAbilityBehaviorParameters & {
    maximumDamage?: AbilityDependentValue<number>
    areaOfEffect?: AbilityDependentValue<number>
    allowedTargetCombatClassifications?: AbilityDependentValue<CombatClassifications>
}

/** The damage of a behavior with everything it depends on resolved, ready to be dealt. */
export type ResolvedDamage = {
    readonly amount: number
    readonly attackType?: AttackType
    readonly damageType?: DamageType
    readonly weaponSoundType?: WeaponSoundType
    readonly metadata?: unknown
}

export type ResolvedAreaDamage = ResolvedDamage & {
    readonly range: number
    readonly allowedTargetCombatClassifications: CombatClassifications
    readonly maximumDamage: number
}

export abstract class DamageAbilityBehavior<
    T extends DamageAbilityBehaviorParameters = DamageAbilityBehaviorParameters,
> extends AbilityBehavior {
    protected constructor(
        ability: Ability,
        protected readonly damage: AbilityDependentValue<number>,
        protected readonly parameters?: T,
    ) {
        super(ability)
    }

    protected precalculatedDamage?: number

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

    /** Resolves the damage as it would be dealt right now. */
    protected resolveDamage(caster: Unit, amount?: number): ResolvedDamage {
        const parameters = this.parameters
        return {
            amount: amount ?? this.precalculatedDamage ?? this.calculateDamage(caster),
            attackType: this.resolveCurrentAbilityDependentValue(parameters?.attackType),
            damageType: parameters?.damageType,
            weaponSoundType: parameters?.weaponSoundType,
            metadata: this.resolveCurrentAbilityDependentValue(parameters?.metadata),
        }
    }

    protected damageTarget(caster: Unit, target: Widget, damage?: number | ResolvedDamage): void {
        if (typeof damage != "object") {
            damage = this.resolveDamage(caster, damage)
        }
        caster.damageTarget(
            target,
            damage.amount,
            undefined,
            undefined,
            damage.attackType,
            damage.damageType,
            damage.weaponSoundType,
            damage.metadata,
        )
    }

    public override onChannelingStart(caster: Unit): void {
        this.precalculatedDamage = this.calculateDamage(caster)
    }

    public override onStop(): void {
        this.precalculatedDamage = undefined
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
        this.damageTarget(caster, caster)
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
        this.damageTarget(caster, target)
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

    /** Resolves the area damage as it would be dealt right now. */
    protected resolveAreaDamage(caster: Unit): ResolvedAreaDamage {
        const parameters = this.parameters
        return {
            ...this.resolveDamage(caster),
            range: this.resolveCurrentAbilityDependentValue(
                parameters?.areaOfEffect ?? AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD,
            ),
            allowedTargetCombatClassifications: this.resolveCurrentAbilityDependentValue(
                parameters?.allowedTargetCombatClassifications ??
                    ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD,
            ),
            maximumDamage: this.resolveCurrentAbilityDependentValue(parameters?.maximumDamage ?? 0),
        }
    }

    protected damageArea(
        caster: Unit,
        x: number,
        y: number,
        damage: ResolvedAreaDamage = this.resolveAreaDamage(caster),
    ): void {
        caster.damageArea(
            x,
            y,
            damage.range,
            damage.allowedTargetCombatClassifications,
            damage.amount,
            damage.maximumDamage,
            undefined,
            undefined,
            damage.attackType,
            damage.damageType,
            damage.weaponSoundType,
            damage.metadata,
        )
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

// === On missile impact ===
//
// The same behaviors, except that an impact launches the missile of the ability at the target of
// the cast and the damage is only dealt once the missile arrives. The damage is resolved when the
// missile is launched, so neither the caster's stats nor the ability (its level, its fields, or
// whether the caster still has it) matter by the time it lands. A cast without a target has
// nothing to launch at and takes effect right away.

export class OnMissileImpactDamageSelfAbilityBehavior extends DamageAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const damage = this.resolveDamage(caster)
        this.onMissileImpact(caster, target, () => this.damageTarget(caster, caster, damage))
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const damage = this.resolveDamage(caster)
        this.onMissileImpact(caster, x, y, () => this.damageTarget(caster, caster, damage))
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.damageTarget(caster, caster)
    }
}

export class OnMissileImpactDamageTargetAbilityBehavior extends DamageAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const damage = this.resolveDamage(caster)
        this.onMissileImpact(caster, target, () => this.damageTarget(caster, target, damage))
    }
}

export class OnMissileImpactDamageSelfAreaAbilityBehavior extends DamageAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAreaAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const damage = this.resolveAreaDamage(caster)
        this.onMissileImpact(caster, target, () =>
            this.damageArea(caster, caster.x, caster.y, damage),
        )
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const damage = this.resolveAreaDamage(caster)
        this.onMissileImpact(caster, x, y, () =>
            this.damageArea(caster, caster.x, caster.y, damage),
        )
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.damageArea(caster, caster.x, caster.y)
    }
}

export class OnMissileImpactDamageTargetAreaAbilityBehavior extends DamageAreaAbilityBehavior {
    public constructor(
        ability: Ability,
        damage: AbilityDependentValue<number>,
        parameters?: DamageAreaAbilityBehaviorParameters,
    ) {
        super(ability, damage, parameters)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const damage = this.resolveAreaDamage(caster)
        this.onMissileImpact(caster, target, () =>
            this.damageArea(caster, target.x, target.y, damage),
        )
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const damage = this.resolveAreaDamage(caster)
        this.onMissileImpact(caster, x, y, () => this.damageArea(caster, x, y, damage))
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.damageArea(caster, caster.x, caster.y)
    }
}
