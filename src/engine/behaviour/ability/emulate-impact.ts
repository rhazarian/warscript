import { AbilityBehavior } from "../ability"
import { Unit } from "../../internal/unit"
import {
    COOLDOWN_ABILITY_FLOAT_LEVEL_FIELD,
    MANA_COST_ABILITY_INTEGER_LEVEL_FIELD,
} from "../../standard/fields/ability"
import { Sound3D, SoundSettings } from "../../../core/types/sound"
import { UnitAbility } from "../../internal/ability"
import { Event } from "../../../event"
import { Item } from "../../internal/item"
import { Destructable } from "../../../core/types/destructable"
import { emulateAbilityImpactEvent } from "../../internal/unit/ability"

export abstract class EmulateImpactAbilityBehavior extends AbilityBehavior {
    /**
     * Pays the cost of the cast and invokes only the common impact event: for impacts
     * that have no cast target to report, such as ones triggered by a command.
     */
    protected emulateImpact(caster: Unit): boolean {
        if (!this.payEmulatedImpact(caster)) {
            return false
        }
        Event.invoke(Unit.abilityImpactEvent, caster, this.ability)
        return true
    }

    protected emulateUnitTargetImpact(caster: Unit, target: Unit): boolean {
        return this.emulateTargetImpact(caster, target, undefined, undefined, target.x, target.y)
    }

    protected emulateItemTargetImpact(caster: Unit, target: Item): boolean {
        return this.emulateTargetImpact(caster, undefined, target, undefined, target.x, target.y)
    }

    protected emulateDestructibleTargetImpact(caster: Unit, target: Destructable): boolean {
        return this.emulateTargetImpact(caster, undefined, undefined, target, target.x, target.y)
    }

    protected emulatePointTargetImpact(caster: Unit, x: number, y: number): boolean {
        return this.emulateTargetImpact(caster, undefined, undefined, undefined, x, y)
    }

    protected emulateNoTargetImpact(caster: Unit): boolean {
        return this.emulateTargetImpact(caster, undefined, undefined, undefined, 0, 0)
    }

    /** Invokes the common impact event and the one matching the target, as a real impact. */
    private emulateTargetImpact(
        caster: Unit,
        targetUnit: Unit | undefined,
        targetItem: Item | undefined,
        targetDestructible: Destructable | undefined,
        x: number,
        y: number,
    ): boolean {
        if (!this.payEmulatedImpact(caster)) {
            return false
        }
        emulateAbilityImpactEvent(
            caster,
            this.ability,
            targetUnit,
            targetItem,
            targetDestructible,
            x,
            y,
        )
        return true
    }

    private payEmulatedImpact(caster: Unit): boolean {
        const manaCost = this.resolveCurrentAbilityDependentValue(
            MANA_COST_ABILITY_INTEGER_LEVEL_FIELD,
        )
        const cooldown = this.resolveCurrentAbilityDependentValue(
            COOLDOWN_ABILITY_FLOAT_LEVEL_FIELD,
        )

        if (
            this.ability.cooldownRemaining != 0 ||
            caster.mana < manaCost ||
            (this.ability instanceof UnitAbility && this.ability.isDisabled)
        ) {
            return false
        }

        caster.mana -= manaCost
        if (cooldown == 0) {
            this.ability.interruptCast()
        } else {
            // Starting the cooldown (unlike setting the remaining time) also aborts the cast.
            this.ability.startCooldown(cooldown)
        }

        this.flashCasterEffect(caster)

        const soundPresetId = this.ability.getField(ABILITY_SF_EFFECT_SOUND)
        if (soundPresetId != "") {
            Sound3D.playFromLabel(soundPresetId, SoundSettings.Ability, caster)
        }

        return true
    }
}
