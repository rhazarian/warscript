import { AbilityBehavior } from "../ability"
import { Unit } from "../../internal/unit"
import { Ability } from "../../internal/ability"
import { AbilityDependentValue } from "../../object-field/ability"
import { BuffPolarity } from "../../object-data/auxiliary/buff-polarity"
import { BuffResistanceType } from "../../object-data/auxiliary/buff-resistance-type"
import { Widget } from "../../../core/types/widget"

/** Which buffs a behavior removes, with everything it depends on resolved. */
export type ResolvedBuffRemoval = {
    readonly polarity?: BuffPolarity
    readonly resistanceType?: BuffResistanceType
    readonly includeExpirationTimers?: boolean
    readonly includeAuras?: boolean
    readonly autoDispel?: boolean
}

abstract class RemoveBuffsAbilityBehavior extends AbilityBehavior {
    protected constructor(
        ability: Ability,
        private readonly polarity?: AbilityDependentValue<BuffPolarity>,
        private readonly resistanceType?: AbilityDependentValue<BuffResistanceType>,
        private readonly includeExpirationTimers?: AbilityDependentValue<boolean>,
        private readonly includeAuras?: AbilityDependentValue<boolean>,
        private readonly autoDispel?: AbilityDependentValue<boolean>,
    ) {
        super(ability)
    }

    /** Resolves which buffs would be removed right now. */
    protected resolveBuffRemoval(): ResolvedBuffRemoval {
        return {
            polarity: this.resolveCurrentAbilityDependentValue(this.polarity),
            resistanceType: this.resolveCurrentAbilityDependentValue(this.resistanceType),
            includeExpirationTimers: this.resolveCurrentAbilityDependentValue(
                this.includeExpirationTimers,
            ),
            includeAuras: this.resolveCurrentAbilityDependentValue(this.includeAuras),
            autoDispel: this.resolveCurrentAbilityDependentValue(this.autoDispel),
        }
    }

    protected removeBuffs(unit: Unit, removal: ResolvedBuffRemoval = this.resolveBuffRemoval()) {
        unit.removeBuffs(
            removal.polarity,
            removal.resistanceType,
            removal.includeExpirationTimers,
            removal.includeAuras,
            removal.autoDispel,
        )
    }
}

export class RemoveBuffsSelfAbilityBehavior extends RemoveBuffsAbilityBehavior {
    public constructor(
        ability: Ability,
        polarity?: AbilityDependentValue<BuffPolarity>,
        resistanceType?: AbilityDependentValue<BuffResistanceType>,
        includeExpirationTimers?: AbilityDependentValue<boolean>,
        includeAuras?: AbilityDependentValue<boolean>,
        autoDispel?: AbilityDependentValue<boolean>,
    ) {
        super(ability, polarity, resistanceType, includeExpirationTimers, includeAuras, autoDispel)
    }

    public override onImpact(caster: Unit) {
        this.removeBuffs(caster)
    }
}

export class RemoveBuffsTargetAbilityBehavior extends RemoveBuffsAbilityBehavior {
    public constructor(
        ability: Ability,
        polarity?: AbilityDependentValue<BuffPolarity>,
        resistanceType?: AbilityDependentValue<BuffResistanceType>,
        includeExpirationTimers?: AbilityDependentValue<boolean>,
        includeAuras?: AbilityDependentValue<boolean>,
        autoDispel?: AbilityDependentValue<boolean>,
    ) {
        super(ability, polarity, resistanceType, includeExpirationTimers, includeAuras, autoDispel)
    }

    public override onUnitTargetImpact(_: Unit, target: Unit) {
        this.removeBuffs(target)
    }
}

// === On missile impact ===
//
// The same behaviors, except that an impact launches the missile of the ability at the target of
// the cast and the buffs are only removed once the missile arrives. Which buffs to remove is
// resolved when the missile is launched, so the ability (its level, its fields, or whether the
// caster still has it) does not matter by the time it lands. A cast without a target has nothing
// to launch at and takes effect right away.

export class OnMissileImpactRemoveBuffsSelfAbilityBehavior extends RemoveBuffsAbilityBehavior {
    public constructor(
        ability: Ability,
        polarity?: AbilityDependentValue<BuffPolarity>,
        resistanceType?: AbilityDependentValue<BuffResistanceType>,
        includeExpirationTimers?: AbilityDependentValue<boolean>,
        includeAuras?: AbilityDependentValue<boolean>,
        autoDispel?: AbilityDependentValue<boolean>,
    ) {
        super(ability, polarity, resistanceType, includeExpirationTimers, includeAuras, autoDispel)
    }

    public override onWidgetTargetImpact(caster: Unit, target: Widget): void {
        const removal = this.resolveBuffRemoval()
        this.onMissileImpact(caster, target, () => this.removeBuffs(caster, removal))
    }

    public override onPointTargetImpact(caster: Unit, x: number, y: number): void {
        const removal = this.resolveBuffRemoval()
        this.onMissileImpact(caster, x, y, () => this.removeBuffs(caster, removal))
    }

    public override onNoTargetImpact(caster: Unit): void {
        this.removeBuffs(caster)
    }
}

export class OnMissileImpactRemoveBuffsTargetAbilityBehavior extends RemoveBuffsAbilityBehavior {
    public constructor(
        ability: Ability,
        polarity?: AbilityDependentValue<BuffPolarity>,
        resistanceType?: AbilityDependentValue<BuffResistanceType>,
        includeExpirationTimers?: AbilityDependentValue<boolean>,
        includeAuras?: AbilityDependentValue<boolean>,
        autoDispel?: AbilityDependentValue<boolean>,
    ) {
        super(ability, polarity, resistanceType, includeExpirationTimers, includeAuras, autoDispel)
    }

    public override onUnitTargetImpact(caster: Unit, target: Unit): void {
        const removal = this.resolveBuffRemoval()
        this.onMissileImpact(caster, target, () => this.removeBuffs(target, removal))
    }
}
