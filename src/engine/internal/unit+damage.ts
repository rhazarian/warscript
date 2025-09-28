import { Unit } from "./unit"
import { Widget } from "../../core/types/widget"
import { Player } from "../../core/types/player"
import { dummyUnitId } from "../../objutil/dummy"
import { AttackType, attackTypeToNative } from "../object-data/auxiliary/attack-type"
import { damageMetadataByTarget } from "./misc/damage-metadata-by-target"

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

export type WeaponType = jweapontype
export namespace WeaponType {
    export const UNKNOWN = WEAPON_TYPE_WHOKNOWS
    export const METAL_LIGHT_CHOP = WEAPON_TYPE_METAL_LIGHT_CHOP
    export const METAL_MEDIUM_CHOP = WEAPON_TYPE_METAL_MEDIUM_CHOP
    export const METAL_HEAVY_CHOP = WEAPON_TYPE_METAL_HEAVY_CHOP
    export const METAL_LIGHT_SLICE = WEAPON_TYPE_METAL_LIGHT_SLICE
    export const METAL_MEDIUM_SLICE = WEAPON_TYPE_METAL_MEDIUM_SLICE
    export const METAL_HEAVY_SLICE = WEAPON_TYPE_METAL_HEAVY_SLICE
    export const METAL_MEDIUM_BASH = WEAPON_TYPE_METAL_MEDIUM_BASH
    export const METAL_HEAVY_BASH = WEAPON_TYPE_METAL_HEAVY_BASH
    export const METAL_MEDIUM_STAB = WEAPON_TYPE_METAL_MEDIUM_STAB
    export const METAL_HEAVY_STAB = WEAPON_TYPE_METAL_HEAVY_STAB
    export const WOOD_LIGHT_SLICE = WEAPON_TYPE_WOOD_LIGHT_SLICE
    export const WOOD_MEDIUM_SLICE = WEAPON_TYPE_WOOD_MEDIUM_SLICE
    export const WOOD_HEAVY_SLICE = WEAPON_TYPE_WOOD_HEAVY_SLICE
    export const WOOD_LIGHT_BASH = WEAPON_TYPE_WOOD_LIGHT_BASH
    export const WOOD_MEDIUM_BASH = WEAPON_TYPE_WOOD_MEDIUM_BASH
    export const WOOD_HEAVY_BASH = WEAPON_TYPE_WOOD_HEAVY_BASH
    export const WOOD_LIGHT_STAB = WEAPON_TYPE_WOOD_LIGHT_STAB
    export const WOOD_MEDIUM_STAB = WEAPON_TYPE_WOOD_MEDIUM_STAB
    export const CLAW_LIGHT_SLICE = WEAPON_TYPE_CLAW_LIGHT_SLICE
    export const CLAW_MEDIUM_SLICE = WEAPON_TYPE_CLAW_MEDIUM_SLICE
    export const CLAW_HEAVY_SLICE = WEAPON_TYPE_CLAW_HEAVY_SLICE
    export const AXE_MEDIUM_CHOP = WEAPON_TYPE_AXE_MEDIUM_CHOP
    export const ROCK_HEAVY_BASH = WEAPON_TYPE_ROCK_HEAVY_BASH
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
            weaponType?: WeaponType,
            metadata?: unknown,
        ): boolean

        /*damageArea(
            x: number,
            y: number,
            allowedTargetCombatClassifications: CombatClassifications,
            amount: number,
            attack?: boolean,
            ranged?: boolean,
            attackType?: AttackType,
            damageType?: DamageType,
            weaponType?: WeaponType,
            metadata?: unknown,
        ): LuaMultiReturn<[boolean, Unit[]]>*/
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
    weaponType = WeaponType.UNKNOWN,
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
        weaponType,
    )
}
