import { Unit } from "./unit"
import "./unit/allowed-targets"
import { Widget } from "../../core/types/widget"
import { Player } from "../../core/types/player"
import { dummyUnitId } from "../../objutil/dummy"
import { AttackType, attackTypeToNative } from "../object-data/auxiliary/attack-type"
import {
    WeaponSoundType,
    weaponSoundTypeToNative,
} from "../object-data/auxiliary/weapon-sound-type"
import { damageMetadataByTarget } from "./misc/damage-metadata-by-target"
import { CombatClassifications } from "../object-data/auxiliary/combat-classification"
import { min } from "../../math"

const createUnit = CreateUnit
const getOwningPlayer = GetOwningPlayer
const showUnit = ShowUnit
const unitDamageTarget = UnitDamageTarget

export type DamageType = jdamagetype
export namespace DamageType {
    export const UNKNOWN = DAMAGE_TYPE_UNKNOWN
    export const NORMAL = DAMAGE_TYPE_NORMAL
    export const ENHANCED = DAMAGE_TYPE_ENHANCED
    export const FIRE = DAMAGE_TYPE_FIRE
    export const COLD = DAMAGE_TYPE_COLD
    export const LIGHTNING = DAMAGE_TYPE_LIGHTNING
    export const POISON = DAMAGE_TYPE_POISON
    export const DISEASE = DAMAGE_TYPE_DISEASE
    export const DIVINE = DAMAGE_TYPE_DIVINE
    export const MAGIC = DAMAGE_TYPE_MAGIC
    export const SONIC = DAMAGE_TYPE_SONIC
    export const ACID = DAMAGE_TYPE_ACID
    export const FORCE = DAMAGE_TYPE_FORCE
    export const DEATH = DAMAGE_TYPE_DEATH
    export const MIND = DAMAGE_TYPE_MIND
    export const PLANT = DAMAGE_TYPE_PLANT
    export const DEFENSIVE = DAMAGE_TYPE_DEFENSIVE
    export const DEMOLITION = DAMAGE_TYPE_DEMOLITION
    export const SLOW_POISON = DAMAGE_TYPE_SLOW_POISON
    export const SPIRIT_LINK = DAMAGE_TYPE_SPIRIT_LINK
    export const SHADOW_STRIKE = DAMAGE_TYPE_SHADOW_STRIKE
    export const UNIVERSAL = DAMAGE_TYPE_UNIVERSAL
}

declare module "./unit" {
    interface Unit {
        damageTarget(
            target: Widget,
            amount: number,
            attack?: boolean,
            ranged?: boolean,
            attackType?: AttackType,
            damageType?: DamageType,
            weaponSoundType?: WeaponSoundType,
            metadata?: unknown,
        ): boolean

        /**
         * Deals amount to each allowed unit in collision range of (x, y).
         * A positive maximumDamage caps the total requested damage, shared equally
         * between the targets. Zero or omitted means unlimited; damage mitigation
         * and damage-event modifiers are applied afterward by damageTarget.
         */
        damageArea(
            x: number,
            y: number,
            range: number,
            allowedTargetCombatClassifications: CombatClassifications,
            amount: number,
            maximumDamage?: number,
            attack?: boolean,
            ranged?: boolean,
            attackType?: AttackType,
            damageType?: DamageType,
            weaponSoundType?: WeaponSoundType,
            metadata?: unknown,
        ): void
    }
}

const dummies = new LuaTable<Player, junit>()
for (const player of Player.all) {
    const dummy = assert(createUnit(player.handle, dummyUnitId, 0, 0, 270))
    showUnit(dummy, false)
    dummies.set(player, dummy)
}

Unit.prototype.damageTarget = function (
    target: Widget,
    amount: number,
    attack = false,
    ranged = false,
    attackType = AttackType.SPELL,
    damageType = DamageType.MAGIC,
    weaponSoundType = WeaponSoundType.NONE,
    metadata?: unknown,
): boolean {
    let handle = this.handle
    const targetHandle = target.handle
    if (!getOwningPlayer(handle)) {
        handle = dummies.get(
            target instanceof Unit ? target.owner : (this["_owner"] ?? Player.neutralAggressive),
        )
    }
    if (target instanceof Unit) {
        damageMetadataByTarget.set(target, metadata)
    }
    return unitDamageTarget(
        handle,
        targetHandle,
        amount,
        attack,
        ranged,
        attackTypeToNative(attackType),
        damageType,
        weaponSoundTypeToNative(weaponSoundType),
    )
}

Unit.prototype.damageArea = function (
    x: number,
    y: number,
    range: number,
    allowedTargetCombatClassifications: CombatClassifications,
    amount: number,
    maximumDamage = 0,
    attack?: boolean,
    ranged?: boolean,
    attackType?: AttackType,
    damageType?: DamageType,
    weaponSoundType?: WeaponSoundType,
    metadata?: unknown,
): void {
    const targets = Unit.getAllowedTargetsInCollisionRange(
        this,
        allowedTargetCombatClassifications,
        x,
        y,
        range,
    )
    if (targets.length == 0) {
        return
    }
    if (maximumDamage > 0) {
        amount = min(amount, maximumDamage / targets.length)
    }
    for (const target of targets) {
        this.damageTarget(
            target,
            amount,
            attack,
            ranged,
            attackType,
            damageType,
            weaponSoundType,
            metadata,
        )
    }
}
