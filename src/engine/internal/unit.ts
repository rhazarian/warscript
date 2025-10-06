import { Handle, HandleDestructor, HandleState } from "../../core/types/handle"
import { Player } from "../../core/types/player"
import { ReadonlyRect } from "../../core/types/rect"
import { Event, EventListener, IgnoreEvent, InitializingEvent, TriggerEvent } from "../../event"
import { Color } from "../../core/types/color"
import { PlayerColor } from "../../core/types/playerColor"
import { Item } from "./item"
import { Destructable } from "../../core/types/destructable"
import {
    AbilityDefinition,
    AbilityDefinitionLightningAttack,
    AbilityDefinitionSpikedCarapace,
} from "../../objutil/ability"
import { Ability, ItemAbility, UnitAbility, UnrecognizedAbility } from "./ability"
import { Widget } from "../../core/types/widget"
import { Timer } from "../../core/types/timer"
import { dummyUnitId } from "../../objutil/dummy"
import { checkNotNull } from "../../utility/preconditions"
import type { UnitTypeId } from "../object-data/entry/unit-type"
import {
    CombatClassification,
    CombatClassifications,
} from "../object-data/auxiliary/combat-classification"
import {
    HEALTH_REGENERATION_RATE_BONUS_PER_STRENGTH_POINT,
    MANA_REGENERATION_RATE_BONUS_PER_INTELLIGENCE_POINT,
} from "../constants"
import { forEach } from "../../utility/arrays"
import { min } from "../../math"
import { ignoreEventsItems } from "./unit/ignore-events-items"
import { MovementType } from "../object-data/auxiliary/movement-type"
import { UnitAttribute } from "../object-data/auxiliary/unit-attribute"
import {
    AttackType,
    attackTypeToNative,
    nativeToAttackType,
} from "../object-data/auxiliary/attack-type"
import { damageMetadataByTarget } from "./misc/damage-metadata-by-target"
import { AttributesHolder, isAttribute } from "../../attributes"
import { doUnitAbilityAction } from "./item/ability"
import type { AbilityTypeId } from "../object-data/entry/ability-type"

const match = string.match
const tostring = _G.tostring

const setUnitAnimation = SetUnitAnimation
const setUnitAnimationByIndex = SetUnitAnimationByIndex
const getUnitIntegerField = BlzGetUnitIntegerField
const getUnitRealField = BlzGetUnitRealField
const getHeroStr = GetHeroStr
const getHeroAgi = GetHeroAgi
const getHeroInt = GetHeroInt
const setHeroStr = SetHeroStr
const setHeroAgi = SetHeroAgi
const setHeroInt = SetHeroInt
const getUnitBooleanField = BlzGetUnitBooleanField
const getUnitStringField = BlzGetUnitStringField
const setUnitIntegerField = BlzSetUnitIntegerField
const setUnitRealField = BlzSetUnitRealField
const setUnitBooleanField = BlzSetUnitBooleanField
const setUnitStringField = BlzSetUnitStringField
const setUnitScale = SetUnitScale
const setUnitPosition = SetUnitPosition
const setUnitTimeScale = SetUnitTimeScale
const getHandleId = GetHandleId
const getUnitCurrentOrder = GetUnitCurrentOrder
const createUnit = CreateUnit
const killUnit = KillUnit
const removeUnit = RemoveUnit
const getUnitTypeId = GetUnitTypeId
const isHeroUnitId = IsHeroUnitId
const getTriggerUnit = GetTriggerUnit
const getManipulatedItem = GetManipulatedItem
const getTriggerPlayer = GetTriggerPlayer
const getSpellAbility = GetSpellAbility
const getSpellAbilityId = GetSpellAbilityId
const getSpellTargetUnit = GetSpellTargetUnit
const getSpellTargetX = GetSpellTargetX
const getSpellTargetY = GetSpellTargetY
const getSpellTargetItem = GetSpellTargetItem
const getSpellTargetDestructable = GetSpellTargetDestructable
const isUnitInRangeXY = IsUnitInRangeXY
const isUnitInRange = IsUnitInRange
const getUnitWeaponRealField = BlzGetUnitWeaponRealField
const setUnitWeaponRealField = BlzSetUnitWeaponRealField
const getUnitWeaponStringField = BlzGetUnitWeaponStringField
const setUnitWeaponStringField = BlzSetUnitWeaponStringField

const getUnitAbilityLevel = GetUnitAbilityLevel

const unitDisableAbility = BlzUnitDisableAbility
const unitInterruptAttack = BlzUnitInterruptAttack
const isUnitInvisible = IsUnitInvisible
const isUnitVisible = IsUnitVisible
const getUnitX = GetUnitX
const getUnitY = GetUnitY
const getUnitFlyHeight = GetUnitFlyHeight
const moveLocation = MoveLocation
const getLocationZ = GetLocationZ

const groupEnumUnitsInRange = GroupEnumUnitsInRange
const groupEnumUnitsInRect = GroupEnumUnitsInRect
const groupEnumUnitsOfPlayer = GroupEnumUnitsOfPlayer
const getFilterUnit = GetFilterUnit
const getUnitCollisionSize = BlzGetUnitCollisionSize

const getOrderedUnit = GetOrderedUnit
const getIssuedOrderId = GetIssuedOrderId

const isUnitInvulnerable = BlzIsUnitInvulnerable
const unitAlive = UnitAlive
const unitAddType = UnitAddType
const unitRemoveType = UnitRemoveType
const isUnitIllusion = IsUnitIllusion
const isUnitType = IsUnitType
const isUnitAlly = IsUnitAlly
const isUnitEnemy = IsUnitEnemy
const getOwningPlayer = GetOwningPlayer

export type UnitClassification = junittype
export namespace UnitClassification {
    export const STRUCTURE = UNIT_TYPE_STRUCTURE
    export const UNDEAD = UNIT_TYPE_UNDEAD
    export const AIR = UNIT_TYPE_FLYING
    export const GROUND = UNIT_TYPE_GROUND
    export const SUMMONED = UNIT_TYPE_SUMMONED
    export const MECHANICAL = UNIT_TYPE_MECHANICAL
    export const WORKER = UNIT_TYPE_PEON
    export const ANCIENT = UNIT_TYPE_ANCIENT
    export const SUICIDAL = UNIT_TYPE_SAPPER
    export const TAUREN = UNIT_TYPE_TAUREN
    export const RESISTANT = UNIT_TYPE_RESISTANT
}

const tremove = table.remove

const loc = Location(0, 0)

const invoke = Event.invoke

const stockAbilities = postcompile(() => {
    const abilityData: Record<number, number[] | undefined> = {}
    if (currentMap) {
        for (const [id, unit] of pairs(currentMap.objects.unit.all)) {
            const ids = (unit.getField("uabi") ?? "")
                .toString()
                .split(",")
                .filter((id) => id != "_" && id != "")
                .map((id) => fourCC(id))
            if (ids.length != 0) {
                abilityData[fourCC(id)] = ids
            }
        }
    }
    return abilityData
})

const attackHandlerAbilityId = compiletime(() => {
    const ability = new AbilityDefinitionLightningAttack()
    ability.graphicDelay = 0
    ability.graphicDuration = 0
    ability.lightningEffects = []
    ability.missileArt = ""
    ability.missileSpeed = 0
    ability.targetArt = ""
    return fourCC(ability.id)
})

const leaveDetectAbilityId = compiletime(fourCC(new AbilityDefinition("Adef").id))
for (const player of Player.all) {
    SetPlayerAbilityAvailable(player.handle, leaveDetectAbilityId, false)
}

const morphDetectAbilityId = compiletime(fourCC(new AbilityDefinition("Adef").id))
for (const player of Player.all) {
    SetPlayerAbilityAvailable(player.handle, morphDetectAbilityId, false)
}

const armorBonusAbilityId = compiletime(() => {
    const ability = new AbilityDefinitionSpikedCarapace()
    ability.levels = 1
    ability.returnedDamageFactor = 0
    ability.receivedDamageFactor = 1
    ability.armorBonus = 0
    return fourCC(ability.id)
})
const armorBonusField = ABILITY_RLF_DEFENSE_BONUS_UTS3

/*const attackBonusAbilityIds = compiletime(() => {
    for (const i of $range(0, 31)) {
        new AbilityDefinition("AItg")
    }
    return []
})*/

const atan = math.atan
const fmod = math.fmod
const sqrt = math.sqrt
const max = math.max
const rad = math.rad
const pi2 = 2 * math.pi

const dummyGroup = CreateGroup()

let targetCollection: Unit[]
let targetCollectionNextIndex: number
let centerX: number
let centerY: number
let enumRange: number
let enumPredicate: ((unit: Unit) => boolean) | undefined
const collectIntoTarget = Filter(() => {
    const unit = getFilterUnit()
    if (getUnitTypeId(unit) != dummyUnitId && getUnitAbilityLevel(unit, leaveDetectAbilityId) > 0) {
        targetCollection[targetCollectionNextIndex - 1] = Unit.of(unit)
        ++targetCollectionNextIndex
    }
})

const collectIntoTargetWithPredicate = Filter(() => {
    const unit = getFilterUnit()
    if (
        getUnitTypeId(unit) != dummyUnitId &&
        getUnitAbilityLevel(unit, leaveDetectAbilityId) > 0 &&
        enumPredicate!(Unit.of(unit))
    ) {
        targetCollection[targetCollectionNextIndex - 1] = Unit.of(unit)
        ++targetCollectionNextIndex
    }
})

let gConsumer: (unit: Unit) => any
let message: string | undefined

const invokeConsumer = Filter(() => {
    const unit = getFilterUnit()
    if (
        message == undefined &&
        getUnitTypeId(unit) != dummyUnitId &&
        getUnitAbilityLevel(unit, leaveDetectAbilityId) > 0
    ) {
        const [success, msg] = pcall(gConsumer, Unit.of(unit))
        if (!success) {
            message = msg
        }
    }
})

const collectIntoTargetCollision = Filter(() => {
    const unit = getFilterUnit()
    if (
        isUnitInRangeXY(unit, centerX, centerY, enumRange) &&
        getUnitTypeId(unit) != dummyUnitId &&
        getUnitAbilityLevel(unit, leaveDetectAbilityId) > 0
    ) {
        targetCollection[targetCollectionNextIndex - 1] = Unit.of(unit)
        ++targetCollectionNextIndex
    }
})

const collectIntoTargetCollisionWithPredicate = Filter(() => {
    const unit = getFilterUnit()
    if (
        isUnitInRangeXY(unit, centerX, centerY, enumRange) &&
        getUnitTypeId(unit) != dummyUnitId &&
        getUnitAbilityLevel(unit, leaveDetectAbilityId) > 0 &&
        enumPredicate!(Unit.of(unit))
    ) {
        targetCollection[targetCollectionNextIndex - 1] = Unit.of(unit)
        ++targetCollectionNextIndex
    }
})
let posX: number
let posY: number
let startAngle: number
let centerAngle: number
const collectSectorIntoTarget = Filter(() => {
    const unit = getFilterUnit()
    if (getUnitTypeId(unit) != dummyUnitId && getUnitAbilityLevel(unit, leaveDetectAbilityId) > 0) {
        let angle = atan(getUnitY(unit) - posY, getUnitX(unit) - posX)
        angle = fmod(angle - startAngle, pi2)
        if ((angle < 0 ? angle + pi2 : angle) <= centerAngle) {
            targetCollection[targetCollectionNextIndex - 1] = Unit.of(unit)
            ++targetCollectionNextIndex
        }
    }
})

function deg2rad(angle: number) {
    angle = fmod(angle, 360)
    return rad(angle < 0 ? angle + 360 : angle)
}

type UnitCollector<T extends any[]> = () =>
    | LuaMultiReturn<[Unit, ...T]>
    | LuaMultiReturn<[IgnoreEvent]>

export class UnitTriggerEvent<T extends any[] = []> extends TriggerEvent<[Unit, ...T]> {
    constructor(eventType: jplayerunitevent, c: UnitCollector<T>) {
        super((trigger: jtrigger) => TriggerRegisterAnyUnitEventBJ(trigger, eventType), c)
    }
}

type DispatcherTable<T extends any[]> = {
    readonly [id: number]: Event<T>
}

type EventDispatcher<T extends any[], S extends any[]> = Event<T> & DispatcherTable<S>

function dispatch<T extends any[], S extends any[]>(
    event: Event<T>,
    idGetter: (this: void, ...args: T) => number,
    argsGetter: (this: void, ...args: T) => LuaMultiReturn<S>,
): EventDispatcher<T, S> {
    let initialized = false
    return setmetatable({} as DispatcherTable<S>, {
        __index(this: DispatcherTable<S>, id: number | keyof typeof event) {
            if (typeof id != "number") {
                return event[id]
            }
            if (!initialized) {
                event.addListener((...args) => {
                    const id = idGetter(...args)
                    const dispatched = rawget(this, id)
                    if (dispatched != undefined) {
                        invoke(dispatched, ...argsGetter(...args))
                    }
                })
                initialized = true
            }
            const dispatched = new Event<S>()
            rawset(this, id, dispatched)
            return dispatched
        },
        __newindex: event,
    }) as EventDispatcher<T, S>
}

function dispatchId<T extends any[]>(
    event: Event<[Unit, number, ...T]>,
): EventDispatcher<[Unit, number, ...T], [Unit, ...T]> {
    return dispatch(
        event,
        (unit, id, ...args) => id,
        (unit, id, ...args) => $multi(unit, ...args),
    )
}

type AbilityDispatcherTable<T extends any[] = []> = {
    readonly [id: number]: Event<[Unit, Ability, ...T]>
}

type AbilityEventDispatcher<T extends any[] = []> = Event<[Unit, Ability, ...T]> &
    AbilityDispatcherTable<T>

function dispatchAbility<T extends any[] = []>(
    event: Event<[Unit, Ability, ...T]>,
): AbilityEventDispatcher<T> {
    let initialized = false
    return setmetatable({} as AbilityDispatcherTable<T>, {
        __index(this: AbilityDispatcherTable<T>, id: number | keyof typeof event) {
            if (typeof id != "number") {
                return event[id]
            }
            if (!initialized) {
                event.addListener((unit, ability, ...args) => {
                    const dispatched = rawget(this, ability.typeId)
                    if (dispatched != undefined) {
                        invoke(dispatched, unit, ability, ...args)
                    }
                })
                initialized = true
            }
            const dispatched = new Event<[Unit, Ability, ...T]>()
            rawset(this, id, dispatched)
            return dispatched
        },
        __newindex: event,
    }) as AbilityEventDispatcher<T>
}

type Collector<T extends any[]> = () => LuaMultiReturn<T>

export interface DamagingEvent extends AttributesHolder {
    amount: number
    attackType: AttackType
    damageType: jdamagetype
    weaponType: jweapontype
    metadata: unknown
    readonly isAttack: boolean
    readonly originalAmount: number
    readonly originalMetadata: unknown

    preventRetaliation(this: DamagingEvent): void
}

const enum DamagingEventPropertyKey {
    SHOULD_PREVENT_RETALIATION,
    RETALIATION_PREVENTION_SOURCE_OWNER,
    RETALIATION_PREVENTION_TARGET_OWNER,
    RETALIATION_PREVENTION_SOURCE_TO_TARGET,
    RETALIATION_PREVENTION_TARGET_TO_SOURCE,
}

type InternalDamagingEvent = DamagingEvent & {
    [DamagingEventPropertyKey.SHOULD_PREVENT_RETALIATION]?: true
    [DamagingEventPropertyKey.RETALIATION_PREVENTION_SOURCE_OWNER]?: jplayer
    [DamagingEventPropertyKey.RETALIATION_PREVENTION_TARGET_OWNER]?: jplayer
    [DamagingEventPropertyKey.RETALIATION_PREVENTION_SOURCE_TO_TARGET]?: true
    [DamagingEventPropertyKey.RETALIATION_PREVENTION_TARGET_TO_SOURCE]?: true
}

function damagingEventPreventRetaliation(this: InternalDamagingEvent): void {
    this[DamagingEventPropertyKey.SHOULD_PREVENT_RETALIATION] = true
}

export type DamageEvent = Omit<DamagingEvent, "preventRetaliation"> & {
    preventDeath<P extends any[]>(
        this: DamageEvent,
        callback: (this: void, ...parameters: P) => any,
        ...parameters: P
    ): void
}

const enum DamageEventPropertyKey {
    PREVENT_DEATH_CALLBACK,
    PREVENT_DEATH_PARAMETERS_LENGTH,
}

type InternalDamageEvent = DamageEvent & {
    [DamageEventPropertyKey.PREVENT_DEATH_CALLBACK]?: (this: void, ...parameters: any) => any
    [DamageEventPropertyKey.PREVENT_DEATH_PARAMETERS_LENGTH]?: number
}

function damageEventPreventDeath<P extends any[]>(
    this: InternalDamageEvent,
    callback: (this: void, ...parameters: P) => any,
    ...parameters: P
): void {
    if ((this as InternalDamageEvent)[DamageEventPropertyKey.PREVENT_DEATH_CALLBACK] != undefined) {
        return
    }
    rawset(this as InternalDamageEvent, DamageEventPropertyKey.PREVENT_DEATH_CALLBACK, callback)
    const parametersLength = select("#", ...parameters)
    rawset(
        this as InternalDamageEvent,
        DamageEventPropertyKey.PREVENT_DEATH_PARAMETERS_LENGTH,
        parametersLength,
    )
    for (const i of $range(1, parametersLength)) {
        rawset(
            this as any,
            DamageEventPropertyKey.PREVENT_DEATH_PARAMETERS_LENGTH + i,
            select(i, ...parameters)[0],
        )
    }
}

const damageSetters = {
    amount: BlzSetEventDamage,
    attackType: (attackType: AttackType): boolean => {
        return BlzSetEventAttackType(attackTypeToNative(attackType))
    },
    damageType: BlzSetEventDamageType,
    weaponType: BlzSetEventWeaponType,
}

export type AttackDamageEvent = DamagingEvent & {
    readonly isAttack: true
    readonly weapon: UnitWeapon
}
export type AttackHandlerCondition = (
    source: Unit,
    target: Unit,
    event: Readonly<AttackDamageEvent>,
) => boolean
export type AttackHandlerAction = (
    source: Unit,
    target: Unit,
    event: AttackDamageEvent & { fire(this: void): void },
) => void
export type AttackHandler = [AttackHandlerCondition, AttackHandlerAction]

export const enum Operator {
    LESS_THAN,
    LESS_THAN_OR_EQUAL,
    EQUAL,
    GREATER_THAN_OR_EQUAL,
    GREATER_THAN,
    NOT_EQUAL,
}

const jlimitopByOperator = {
    [Operator.LESS_THAN]: LESS_THAN_OR_EQUAL, // value should be preprocessed
    [Operator.LESS_THAN_OR_EQUAL]: LESS_THAN_OR_EQUAL,
    [Operator.EQUAL]: EQUAL,
    [Operator.GREATER_THAN_OR_EQUAL]: GREATER_THAN_OR_EQUAL,
    [Operator.GREATER_THAN]: GREATER_THAN_OR_EQUAL, // value should be preprocessed
    [Operator.NOT_EQUAL]: NOT_EQUAL,
} as const

const modifiers = {
    speed: (unit: junit, value: number): void => {
        SetUnitMoveSpeed(unit, GetUnitMoveSpeed(unit) + value)
    },
    armor: (unit: junit, value: number): void => {
        if (UnitAddAbility(unit, armorBonusAbilityId)) {
            assert(UnitMakeAbilityPermanent(unit, true, armorBonusAbilityId))
        }
        const ability = assert(BlzGetUnitAbility(unit, armorBonusAbilityId))
        assert(
            BlzSetAbilityRealLevelField(
                ability,
                armorBonusField,
                0,
                BlzGetAbilityRealLevelField(ability, armorBonusField, 0) + value,
            ),
        )
    },
}

const getters = {
    speed: (unit: junit, delta: number): number => {
        return GetUnitMoveSpeed(unit) + delta
    },
    armor: (unit: junit): number => {
        return BlzGetUnitArmor(unit)
    },
}

export class UnitWeapon {
    public constructor(
        public readonly unit: Unit,
        public readonly index: 0 | 1,
    ) {}

    public get cooldown(): number {
        return getUnitWeaponRealField(
            this.unit.handle,
            UNIT_WEAPON_RF_ATTACK_BASE_COOLDOWN,
            this.index,
        )
    }

    public set cooldown(cooldown: number) {
        setUnitWeaponRealField(
            this.unit.handle,
            UNIT_WEAPON_RF_ATTACK_BASE_COOLDOWN,
            this.index,
            cooldown,
        )
    }

    public get damage(): [minimumDamage: number, maximumDamage: number] {
        const minimumDamage = this.damageBase + this.damageDiceCount
        const maximumDamage = this.damageBase + this.damageDiceCount * this.damageDiceSideCount
        return [minimumDamage, maximumDamage]
    }

    public set damage([minimumDamage, maximumDamage]: [number, number]) {
        this.damageBase = minimumDamage - 1
        this.damageDiceCount = 1
        this.damageDiceSideCount = maximumDamage - minimumDamage + 1
    }

    public get allowedTargetCombatClassifications(): CombatClassifications {
        return BlzGetUnitWeaponIntegerField(
            this.unit.handle,
            UNIT_WEAPON_IF_ATTACK_TARGETS_ALLOWED,
            this.index,
        ) as CombatClassifications
    }

    public set allowedTargetCombatClassifications(
        allowedTargetCombatClassifications: CombatClassifications,
    ) {
        BlzSetUnitWeaponIntegerField(
            this.unit.handle,
            UNIT_WEAPON_IF_ATTACK_TARGETS_ALLOWED,
            this.index,
            allowedTargetCombatClassifications,
        )
    }

    public get damageBase(): number {
        return BlzGetUnitBaseDamage(this.unit.handle, this.index)
    }

    public set damageBase(damageBase: number) {
        BlzSetUnitBaseDamage(this.unit.handle, this.index, damageBase)
    }

    public get damageDiceCount(): number {
        return BlzGetUnitDiceNumber(this.unit.handle, this.index)
    }

    public set damageDiceCount(damageDiceCount: number) {
        BlzSetUnitDiceNumber(this.unit.handle, this.index, damageDiceCount)
    }

    public get damageDiceSideCount(): number {
        return BlzGetUnitDiceSides(this.unit.handle, this.index)
    }

    public set damageDiceSideCount(damageDiceSideCount: number) {
        BlzSetUnitDiceSides(this.unit.handle, this.index, damageDiceSideCount)
    }

    public get range(): number {
        return getUnitWeaponRealField(this.unit.handle, UNIT_WEAPON_RF_ATTACK_RANGE, this.index)
    }

    public set range(range: number) {
        const handle = this.unit.handle
        const index = this.index
        setUnitWeaponRealField(
            handle,
            UNIT_WEAPON_RF_ATTACK_RANGE,
            index + 1,
            getUnitWeaponRealField(handle, UNIT_WEAPON_RF_ATTACK_RANGE, index + 1) +
                (range - getUnitWeaponRealField(handle, UNIT_WEAPON_RF_ATTACK_RANGE, index)),
        )
    }

    public get impactDelay(): number {
        return getUnitWeaponRealField(
            this.unit.handle,
            UNIT_WEAPON_RF_ATTACK_DAMAGE_POINT,
            this.index,
        )
    }

    public set impactDelay(impactDelay: number) {
        setUnitWeaponRealField(
            this.unit.handle,
            UNIT_WEAPON_RF_ATTACK_DAMAGE_POINT,
            this.index,
            impactDelay,
        )
    }

    public get missileArc(): number {
        return getUnitWeaponRealField(
            this.unit.handle,
            UNIT_WEAPON_RF_ATTACK_PROJECTILE_ARC,
            this.index,
        )
    }

    public set missileArc(missileArc: number) {
        setUnitWeaponRealField(
            this.unit.handle,
            UNIT_WEAPON_RF_ATTACK_PROJECTILE_ARC,
            this.index,
            missileArc,
        )
    }

    public get missileModelPath(): string {
        return getUnitWeaponStringField(
            this.unit.handle,
            UNIT_WEAPON_SF_ATTACK_PROJECTILE_ART,
            this.index,
        )
    }

    public set missileModelPath(missileModelPath: string) {
        setUnitWeaponStringField(
            this.unit.handle,
            UNIT_WEAPON_SF_ATTACK_PROJECTILE_ART,
            this.index,
            missileModelPath,
        )
    }

    public get missileSpeed(): number {
        return getUnitWeaponRealField(
            this.unit.handle,
            UNIT_WEAPON_RF_ATTACK_PROJECTILE_SPEED,
            this.index,
        )
    }

    public set missileSpeed(missileSpeed: number) {
        setUnitWeaponRealField(
            this.unit.handle,
            UNIT_WEAPON_RF_ATTACK_PROJECTILE_SPEED,
            this.index,
            missileSpeed,
        )
    }
}

const unitInventorySize = UnitInventorySize
const unitItemInSlot = UnitItemInSlot
const getItemAbility = BlzGetItemAbility
const getUnitAbility = BlzGetUnitAbility
const getUnitAbilityByIndex = BlzGetUnitAbilityByIndex
const getAbilityId = BlzGetAbilityId
const getAbilityName = GetAbilityName
const unitAddAbility = UnitAddAbility
const getUnitGoldCost = GetUnitGoldCost
const getUnitLumberCost = GetUnitWoodCost
const unitRemoveAbility = UnitRemoveAbility

function retrieveAbility(unit: junit, ability: jability | undefined, abilityId: number): Ability {
    if (ability == undefined) {
        return new UnrecognizedAbility(abilityId, Unit.of(unit))
    }
    for (const i of $range(0, unitInventorySize(unit) - 1)) {
        const item = unitItemInSlot(unit, i)
        if (getItemAbility(item, abilityId) == ability) {
            return ItemAbility.of(ability, abilityId, Item.of(item))
        }
    }
    return UnitAbility.of(ability, abilityId, Unit.of(unit))
}

type junitfield = junitintegerfield | junitrealfield | junitbooleanfield | junitstringfield

const fieldGetters: Record<string, (unit: Unit, field: any) => number | boolean | string> = {
    unitintegerfield: (unit: Unit, field: junitintegerfield): number => {
        return getUnitIntegerField(unit.handle, field)
    },
    unitrealfield: (unit: Unit, field: junitrealfield): number => {
        return getUnitRealField(unit.handle, field)
    },
    unitbooleanfield: (unit: Unit, field: junitbooleanfield): boolean => {
        return getUnitBooleanField(unit.handle, field)
    },
    unitstringfield: (unit: Unit, field: junitstringfield): string => {
        return getUnitStringField(unit.handle, field)
    },
}

const fieldSetters: Record<string, (unit: Unit, field: any, value: any) => boolean> = {
    unitintegerfield: (unit: Unit, field: junitintegerfield, value: number) => {
        return setUnitIntegerField(unit.handle, field, value)
    },
    unitrealfield: (unit: Unit, field: junitrealfield, value: number) => {
        return setUnitRealField(unit.handle, field, value)
    },
    unitbooleanfield: (unit: Unit, field: junitbooleanfield, value: boolean) => {
        return setUnitBooleanField(unit.handle, field, value)
    },
    unitstringfield: (unit: Unit, field: junitstringfield, value: string) => {
        return setUnitStringField(unit.handle, field, value)
    },
}

const dummies = new LuaTable<Player, junit>()
for (const player of Player.all) {
    const dummy = assert(createUnit(player.handle, dummyUnitId, 0, 0, 270))
    ShowUnit(dummy, false)
    dummies.set(player, dummy)
}

const enum UnitPropertyKey {
    SYNC_ID = 100,
    IS_PAUSED,
    STUN_COUNTER,
    DELAY_HEALTH_CHECKS_COUNTER,
    DELAY_HEALTH_CHECKS_HEALTH_BONUS,
    PREVENT_DEATH_HEALTH_BONUS,
    IS_TEAM_GLOW_HIDDEN,
    LAST_X,
    LAST_Y,
}

const delayHealthChecksCallback = (unit: Unit): void => {
    const counter = (unit[UnitPropertyKey.DELAY_HEALTH_CHECKS_COUNTER] ?? 0) - 1
    if (counter != 0) {
        unit[UnitPropertyKey.DELAY_HEALTH_CHECKS_COUNTER] = counter
        return
    }
    unit[UnitPropertyKey.DELAY_HEALTH_CHECKS_COUNTER] = undefined
    const healthBonus = unit[UnitPropertyKey.DELAY_HEALTH_CHECKS_HEALTH_BONUS]
    if (healthBonus != undefined) {
        unit[UnitPropertyKey.DELAY_HEALTH_CHECKS_HEALTH_BONUS] = undefined
        const handle = unit.handle
        BlzSetUnitMaxHP(handle, BlzGetUnitMaxHP(handle) - healthBonus)
    }
}

let nextSyncId = 1

const unitBySyncId = setmetatable(new LuaMap<number, Unit>(), { __mode: "v" })

export type UnitSyncId = number & { readonly __unitSyncId: unique symbol }

const damagingEventByTarget = setmetatable(new LuaMap<Unit, InternalDamagingEvent>(), {
    __mode: "k",
})

const addAbility = (unit: Unit, abilityTypeId: AbilityTypeId): UnitAbility | undefined => {
    const handle = unit["handle"]
    if (unitAddAbility(handle, abilityTypeId)) {
        const ability = UnitAbility.of(
            checkNotNull(getUnitAbility(handle, abilityTypeId)),
            abilityTypeId,
            unit,
        )
        const abilities = unit.abilities as UnitAbility[]
        abilities[abilities.length] = ability
        return ability
    }
    return undefined
}

const getAbility = (unit: Unit, abilityTypeId: AbilityTypeId): UnitAbility | undefined => {
    return UnitAbility.of(getUnitAbility(unit["handle"], abilityTypeId), abilityTypeId, unit)
}

const removeAbility = (unit: Unit, abilityTypeId: AbilityTypeId): boolean => {
    if (unitRemoveAbility(unit["handle"], abilityTypeId)) {
        const abilities = unit.abilities as UnitAbility[]
        for (const i of $range(1, abilities.length)) {
            if (abilities[i - 1].typeId == abilityTypeId) {
                abilities[i - 1].destroy()
                tremove(abilities, i)
                return true
            }
        }
        return true
    }
    return false
}

export class Unit extends Handle<junit> {
    public readonly syncId = nextSyncId++ as UnitSyncId
    private [UnitPropertyKey.IS_PAUSED]?: true
    private [UnitPropertyKey.STUN_COUNTER]?: number
    private [UnitPropertyKey.DELAY_HEALTH_CHECKS_COUNTER]?: number
    private [UnitPropertyKey.DELAY_HEALTH_CHECKS_HEALTH_BONUS]?: number
    private [UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS]?: number
    private [UnitPropertyKey.IS_TEAM_GLOW_HIDDEN]?: true
    private [UnitPropertyKey.LAST_X]?: number
    private [UnitPropertyKey.LAST_Y]?: number

    private _owner?: Player

    private _timeScale?: number

    private events?: { [eventId: number]: TriggerEvent<any> } // TODO: should be a LinkedMap to destroy in order
    private _attackHandlers?: [AttackHandlerCondition, AttackHandlerAction][]

    private _eventsToDestroy?: TriggerEvent<any>[]

    private _fields?: LuaTable<junitweaponrealfield, number>

    private getEvent(event: junitevent, c: void): Event
    private getEvent<T extends any[]>(event: junitevent, collector: Collector<T>): Event<T>

    private getEvent<T extends any[] | []>(event: junitevent, collector: any): Event<T> {
        this.events = this.events || {}
        const eventId = GetHandleId(event)
        if (!this.events[eventId]) {
            this.events[eventId] = new TriggerEvent<T>(
                (trigger) => {
                    TriggerRegisterUnitEvent(trigger, this.handle, event)
                },
                collector || (() => []),
            )
        }
        return this.events[eventId]
    }

    public constructor(handle: junit) {
        super(handle)
        this._owner = Player.of(getOwningPlayer(handle))
        assert(
            unitAddAbility(handle, leaveDetectAbilityId) &&
                UnitMakeAbilityPermanent(handle, true, leaveDetectAbilityId),
        )
        assert(unitAddAbility(handle, morphDetectAbilityId))
        if (unitAddAbility(handle, fourCC("Amrf"))) {
            assert(unitRemoveAbility(handle, fourCC("Amrf")))
        }
        unitBySyncId.set(this.syncId, this)
        this.abilities
    }

    protected override onDestroy(): HandleDestructor {
        const handle = this.handle

        this[UnitPropertyKey.LAST_X] = getUnitX(handle)
        this[UnitPropertyKey.LAST_Y] = getUnitY(handle)

        if (!this._owner) {
            this._owner = Player.of(getOwningPlayer(handle))
        }

        const abilities = this.abilities as UnitAbility[]
        for (const ability of abilities) {
            ability.destroy()
        }
        abilities.length = 0

        for (const player of Player.all) {
            if (this.isSelected(player)) {
                Event.invoke(Unit.onDeselect, this, player)
            }
        }

        if (this.events) {
            for (const [, event] of pairs(this.events)) {
                event.destroy()
            }
        }

        const eventsToDestroy = this._eventsToDestroy
        if (eventsToDestroy != undefined) {
            forEach(eventsToDestroy, "destroy")
        }

        if (getUnitAbilityLevel(handle, leaveDetectAbilityId) > 0) {
            unitRemoveAbility(handle, leaveDetectAbilityId)
            removeUnit(handle)
        }

        return super.onDestroy()
    }

    public addAttackHandler(
        condition: AttackHandlerCondition,
        action: AttackHandlerAction,
    ): AttackHandler {
        const handler: AttackHandler = [condition, warpack.wrapThread(action)]

        const handlers = this._attackHandlers ?? []
        handlers[handlers.length] = handler
        this._attackHandlers = handlers
        if (handlers.length == 1) {
            const handle = this.handle
            assert(
                unitAddAbility(handle, attackHandlerAbilityId) &&
                    UnitMakeAbilityPermanent(handle, true, attackHandlerAbilityId),
            )
        }

        return handler
    }

    public removeAttackHandler(handler: AttackHandler): boolean {
        const handlers = this._attackHandlers
        if (handlers) {
            for (const i of $range(1, handlers.length)) {
                if (handlers[i - 1] == handler) {
                    tremove(handlers, i)
                    return true
                }
            }
        }
        return false
    }

    private get _deltas(): Record<string, number | undefined> {
        const deltas = {}
        rawset(this as any, "_deltas", deltas)
        return deltas
    }

    public addModifier(
        //property: {
        //    [P in keyof Unit]: Unit[P] extends number ? P : never
        //}[keyof Unit],
        property: keyof typeof modifiers,
        modifier: (value: number) => number,
    ): Destroyable {
        const handle = this.handle
        const deltas = this._deltas
        const delta = deltas[property] ?? 0
        const addition = modifier(getters[property](handle, delta))
        modifiers[property](handle, addition)
        deltas[property] = delta + addition
        return {
            destroy: () => {
                modifiers[property](handle, -addition)
                deltas[property] = (deltas[property] ?? 0) - addition
            },
        }
    }

    public get skinId(): number {
        return BlzGetUnitSkin(this.handle)
    }

    public set skinId(v: number) {
        BlzSetUnitSkin(this.handle, v)
    }

    public get typeId(): UnitTypeId {
        return getUnitTypeId(this.handle) as UnitTypeId
    }

    public get isHero(): boolean {
        return isHeroUnitId(getUnitTypeId(this.handle))
    }

    public get isAlive(): boolean {
        return unitAlive(this.handle)
    }

    public get isDead(): boolean {
        return !unitAlive(this.handle)
    }

    public get isIllusion(): boolean {
        return isUnitIllusion(this.handle)
    }

    public get isStunned(): boolean {
        return getUnitCurrentOrder(this.handle) == orderId("stunned")
    }

    public get combatClassifications(): CombatClassifications {
        return getUnitIntegerField(this.handle, UNIT_IF_TARGETED_AS) as CombatClassifications
    }

    public set combatClassifications(combatClassifications: CombatClassifications) {
        setUnitIntegerField(this.handle, UNIT_IF_TARGETED_AS, combatClassifications)
    }

    public hasCombatClassification(combatClassification: CombatClassification): boolean {
        return (getUnitIntegerField(this.handle, UNIT_IF_TARGETED_AS) as CombatClassifications).has(
            combatClassification,
        )
    }

    public addClassification(classification: UnitClassification): boolean {
        return unitAddType(this.handle, classification)
    }

    public removeClassification(classification: UnitClassification): boolean {
        return unitRemoveType(this.handle, classification)
    }

    public hasClassification(classification: UnitClassification): boolean {
        return isUnitType(this.handle, classification)
    }

    public isVisibleTo(player: Player): boolean {
        return isUnitVisible(this.handle, player.handle)
    }

    public isInvisibleTo(player: Player): boolean {
        return isUnitInvisible(this.handle, player.handle)
    }

    public isInRangeOf(x: number, y: number, range: number): boolean
    public isInRangeOf(unit: Unit, range: number): boolean

    public isInRangeOf(x: number | Unit, y: number, range?: number): boolean {
        return typeof x == "number"
            ? isUnitInRangeXY(this.handle, x, y, range!)
            : isUnitInRange(this.handle, x.handle, y)
    }

    public isAllyOf(unit: Unit): boolean {
        return isUnitAlly(this.handle, getOwningPlayer(unit.handle))
    }

    public isEnemyOf(unit: Unit): boolean {
        return isUnitEnemy(this.handle, getOwningPlayer(unit.handle))
    }

    public playAnimation(animation: string, rarity?: jraritycontrol): void
    public playAnimation(animation: number): void

    public playAnimation(animation: string | number, rarity?: jraritycontrol): void {
        if (typeof animation == "number") {
            setUnitAnimationByIndex(this.handle, animation)
        } else if (rarity) {
            SetUnitAnimationWithRarity(this.handle, animation, rarity)
        } else {
            setUnitAnimation(this.handle, animation)
        }
    }

    public resetAnimation(): void {
        ResetUnitAnimation(this.handle)
    }

    public queueAnimation(animation: string): void {
        QueueUnitAnimation(this.handle, animation)
    }

    public get weapons(): [UnitWeapon, UnitWeapon] {
        return [this.firstWeapon, this.secondWeapon]
    }

    public get firstWeapon(): UnitWeapon {
        const weapon = new UnitWeapon(this, 0)
        rawset(this, "firstWeapon", weapon)
        return weapon
    }

    public get secondWeapon(): UnitWeapon {
        const weapon = new UnitWeapon(this, 1)
        rawset(this, "secondWeapon", weapon)
        return weapon
    }

    public chooseWeapon(target: Unit): UnitWeapon | undefined {
        if (target.isAllowedTarget(this, this.firstWeapon.allowedTargetCombatClassifications)) {
            return this.firstWeapon
        }
        if (target.isAllowedTarget(target, this.secondWeapon.allowedTargetCombatClassifications)) {
            return this.secondWeapon
        }
        return undefined
    }

    public get level(): number {
        return GetHeroLevel(this.handle)
    }

    public set level(v: number) {
        const handle = this.handle
        const level = GetHeroLevel(handle)
        // SetHeroLevel(firstLevelHero, 1, false) -> 2 :/
        if (v > level) {
            SetHeroLevel(handle, v, false)
        } else {
            UnitStripHeroLevel(handle, level - v)
        }
    }

    get xp(): number {
        return GetHeroXP(this.handle)
    }

    set xp(v: number) {
        SetHeroXP(this.handle, v, false)
    }

    public get primaryAttribute(): UnitAttribute {
        return getUnitIntegerField(this.handle, UNIT_IF_PRIMARY_ATTRIBUTE) as UnitAttribute
    }

    public set primaryAttribute(primaryAttribute: UnitAttribute) {
        setUnitIntegerField(this.handle, UNIT_IF_PRIMARY_ATTRIBUTE, primaryAttribute)
    }

    public get strengthBase(): number {
        return getHeroStr(this.handle, false)
    }

    public set strengthBase(strengthBase: number) {
        setHeroStr(this.handle, strengthBase, true)
    }

    public get strengthBonus(): number {
        const handle = this.handle
        return getHeroStr(handle, true) - getHeroStr(handle, false)
    }

    public get strength(): number {
        return getHeroStr(this.handle, true)
    }

    public get agilityBase(): number {
        return getHeroAgi(this.handle, false)
    }

    public set agilityBase(agilityBase: number) {
        setHeroAgi(this.handle, agilityBase, true)
    }

    public get agilityBonus(): number {
        const handle = this.handle
        return getHeroAgi(handle, true) - getHeroAgi(handle, false)
    }

    public get agility(): number {
        return getHeroAgi(this.handle, true)
    }

    public get intelligenceBase(): number {
        return getHeroInt(this.handle, false)
    }

    public set intelligenceBase(intelligenceBase: number) {
        setHeroInt(this.handle, intelligenceBase, true)
    }

    public get intelligenceBonus(): number {
        const handle = this.handle
        return getHeroInt(handle, true) - getHeroInt(handle, false)
    }

    public get intelligence(): number {
        return getHeroInt(this.handle, true)
    }

    get name(): string {
        return GetUnitName(this.handle)
    }

    set name(v: string) {
        BlzSetUnitName(this.handle, v)
    }

    get properName(): string {
        return GetHeroProperName(this.handle)
    }

    set properName(v: string) {
        BlzSetHeroProperName(this.handle, v)
    }

    public get isTeamGlowVisible(): boolean {
        return !this[UnitPropertyKey.IS_TEAM_GLOW_HIDDEN]
    }

    public set isTeamGlowVisible(isTeamGlowVisible: boolean) {
        BlzShowUnitTeamGlow(this.handle, isTeamGlowVisible)
        this[UnitPropertyKey.IS_TEAM_GLOW_HIDDEN] = !isTeamGlowVisible ? true : undefined
    }

    public set color(color: PlayerColor) {
        SetUnitColor(this.handle, color.handle)
        if (this[UnitPropertyKey.IS_TEAM_GLOW_HIDDEN]) {
            BlzShowUnitTeamGlow(this.handle, false)
        }
    }

    public get acquisitionRange(): number {
        return GetUnitAcquireRange(this.handle)
    }

    public set acquisitionRange(v: number) {
        SetUnitAcquireRange(this.handle, v)
    }

    /**
     * Keeps this unit alive even if its health becomes negative until the current game thread yields.
     */
    public delayHealthChecks(): void {
        this[UnitPropertyKey.DELAY_HEALTH_CHECKS_COUNTER] =
            (this[UnitPropertyKey.DELAY_HEALTH_CHECKS_COUNTER] ?? 0) + 1
        Timer.run(delayHealthChecksCallback, this)
    }

    public get maxHealth(): number {
        return (
            BlzGetUnitMaxHP(this.handle) -
            (this[UnitPropertyKey.DELAY_HEALTH_CHECKS_HEALTH_BONUS] ?? 0) -
            (this[UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS] ?? 0)
        )
    }

    public set maxHealth(maxHealth: number) {
        if (maxHealth < 1 && this[UnitPropertyKey.DELAY_HEALTH_CHECKS_COUNTER] != undefined) {
            this[UnitPropertyKey.DELAY_HEALTH_CHECKS_HEALTH_BONUS] =
                (this[UnitPropertyKey.DELAY_HEALTH_CHECKS_HEALTH_BONUS] ?? 0) + (1 - maxHealth)
            maxHealth = 1
        }
        BlzSetUnitMaxHP(
            this.handle,
            maxHealth + (this[UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS] ?? 0),
        )
    }

    public get healthRegenerationRate(): number {
        const handle = this.handle
        return (
            getUnitRealField(handle, UNIT_RF_HIT_POINTS_REGENERATION_RATE) +
            getHeroStr(handle, true) * HEALTH_REGENERATION_RATE_BONUS_PER_STRENGTH_POINT
        )
    }

    public set healthRegenerationRate(healthRegenerationRate: number) {
        const handle = this.handle
        setUnitRealField(
            handle,
            UNIT_RF_HIT_POINTS_REGENERATION_RATE,
            healthRegenerationRate -
                getHeroStr(handle, true) * HEALTH_REGENERATION_RATE_BONUS_PER_STRENGTH_POINT,
        )
    }

    public get maxMana(): number {
        return BlzGetUnitMaxMana(this.handle)
    }

    public set maxMana(maxMana: number) {
        BlzSetUnitMaxMana(this.handle, maxMana)
    }

    public get health(): number {
        return GetWidgetLife(this.handle) - (this[UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS] ?? 0)
    }

    public set health(health: number) {
        SetWidgetLife(this.handle, health + (this[UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS] ?? 0))
    }

    public get mana(): number {
        return GetUnitState(this.handle, UNIT_STATE_MANA)
    }

    public set mana(mana: number) {
        SetUnitState(this.handle, UNIT_STATE_MANA, mana)
    }

    public get manaRegenerationRate(): number {
        const handle = this.handle
        return (
            getUnitRealField(handle, UNIT_RF_MANA_REGENERATION) +
            getHeroInt(handle, true) * MANA_REGENERATION_RATE_BONUS_PER_INTELLIGENCE_POINT
        )
    }

    public set manaRegenerationRate(manaRegenerationRate: number) {
        const handle = this.handle
        setUnitRealField(
            handle,
            UNIT_RF_MANA_REGENERATION,
            manaRegenerationRate -
                getHeroInt(handle, true) * MANA_REGENERATION_RATE_BONUS_PER_INTELLIGENCE_POINT,
        )
    }

    public get armor(): number {
        return BlzGetUnitArmor(this.handle)
    }

    public set armor(armor: number) {
        BlzSetUnitArmor(this.handle, armor)
    }

    get facing(): number {
        return GetUnitFacing(this.handle)
    }

    set facing(v: number) {
        BlzSetUnitFacingEx(this.handle, v)
    }

    get speed(): number {
        return GetUnitMoveSpeed(this.handle)
    }

    set speed(v: number) {
        SetUnitMoveSpeed(this.handle, v)
    }

    get flyHeight(): number {
        return getUnitFlyHeight(this.handle)
    }

    set flyHeight(v: number) {
        SetUnitFlyHeight(this.handle, v, 100000)
    }

    get x(): number {
        return this[UnitPropertyKey.LAST_X] ?? getUnitX(this.handle)
    }

    set x(v: number) {
        SetUnitX(this.handle, v)
    }

    get y(): number {
        return this[UnitPropertyKey.LAST_Y] ?? getUnitY(this.handle)
    }

    set y(v: number) {
        SetUnitY(this.handle, v)
    }

    public get z(): number {
        const handle = this.handle
        moveLocation(loc, getUnitX(handle), getUnitY(handle))
        return getUnitFlyHeight(handle) + getLocationZ(loc)
    }

    set xy(v: Vec2) {
        SetUnitX(this.handle, v.x)
        SetUnitY(this.handle, v.y)
    }

    public setPosition(x: number, y: number): void {
        setUnitPosition(this.handle, x, y)
    }

    get position(): Vec2 {
        return vec2(getUnitX(this.handle), getUnitY(this.handle))
    }

    set position(v: Vec2) {
        SetUnitPosition(this.handle, v.x, v.y)
    }

    public get owner(): Player {
        return Player.of(getOwningPlayer(this.handle)) ?? this._owner ?? Player.neutralExtra
    }

    public set owner(v: Player) {
        SetUnitOwner(this.handle, v.handle, false)
        if (this._owner) {
            this._owner = v
        }
    }

    public get goldCost(): number {
        const typeId = getUnitTypeId(this.handle)
        return isHeroUnitId(typeId) ? 0 : getUnitGoldCost(typeId)
    }

    public get lumberCost(): number {
        const typeId = getUnitTypeId(this.handle)
        return isHeroUnitId(typeId) ? 0 : getUnitLumberCost(typeId)
    }

    /** The amount of gold left in the gold mine. */
    public get gold(): number {
        return GetResourceAmount(this.handle)
    }

    public set gold(gold: number) {
        SetResourceAmount(this.handle, gold)
    }

    public get isPaused(): boolean {
        return IsUnitPaused(this.handle)
    }

    public set isPaused(isPaused: boolean) {
        const handle = this.handle
        if (isPaused && !IsUnitPaused(handle)) {
            this[UnitPropertyKey.IS_PAUSED] = true
            for (const _ of $range(this[UnitPropertyKey.STUN_COUNTER] ?? 0, -1)) {
                BlzPauseUnitEx(handle, true)
            }
            PauseUnit(handle, true)
        } else if (!isPaused && IsUnitPaused(handle)) {
            PauseUnit(handle, false)
            for (const _ of $range(this[UnitPropertyKey.STUN_COUNTER] ?? 0, -1)) {
                BlzPauseUnitEx(handle, false)
            }
            this[UnitPropertyKey.IS_PAUSED] = undefined
        }
    }

    get hidden(): boolean {
        return IsUnitHidden(this.handle)
    }

    set hidden(v: boolean) {
        if (v) {
            ShowUnitHide(this.handle)
        } else {
            ShowUnitShow(this.handle)
        }
    }

    public get isInvulnerable(): boolean {
        return isUnitInvulnerable(this.handle)
    }

    public get vertexColor(): Color {
        const handle = this.handle
        return Color.of(
            getUnitIntegerField(handle, UNIT_IF_TINTING_COLOR_RED),
            getUnitIntegerField(handle, UNIT_IF_TINTING_COLOR_GREEN),
            getUnitIntegerField(handle, UNIT_IF_TINTING_COLOR_BLUE),
            getUnitIntegerField(handle, UNIT_IF_TINTING_COLOR_ALPHA),
        )
    }

    public set vertexColor(v: Color) {
        SetUnitVertexColor(this.handle, v.r, v.g, v.b, v.a)
    }

    public get scale(): number {
        return getUnitRealField(this.handle, UNIT_RF_SCALING_VALUE)
    }

    public set scale(v: number) {
        setUnitScale(this.handle, v, v, v)
        setUnitRealField(this.handle, UNIT_RF_SCALING_VALUE, v)
    }

    public get timeScale(): number {
        return this._timeScale ?? 1
    }

    public set timeScale(v: number) {
        setUnitTimeScale(this.handle, v)
        this._timeScale = v != 1 ? v : undefined
    }

    public get collisionSize(): number {
        return getUnitCollisionSize(this.handle)
    }

    public get pathingCollisionRange(): number {
        return 16 * (min(math.idiv(getUnitCollisionSize(this.handle), 16), 3) + 1)
    }

    public get movementType(): MovementType {
        return getUnitIntegerField(this.handle, UNIT_IF_MOVE_TYPE) as MovementType
    }

    public set movementType(movementType: MovementType) {
        setUnitIntegerField(this.handle, UNIT_IF_MOVE_TYPE, movementType)
    }

    set pathing(v: boolean) {
        SetUnitPathing(this.handle, v)
    }

    public isSelected(player: Player): boolean {
        return IsUnitSelected(this.handle, player.handle)
    }

    public explode(): void {
        SetUnitExploded(this.handle, true)
        killUnit(this.handle)
    }

    public kill(): void {
        killUnit(this.handle)
    }

    public revive(x: number, y: number, doEffect?: boolean): void {
        ReviveHero(this.handle, x, y, doEffect ?? false)
    }

    public healTarget(target: Widget, amount: number): void {
        if (target instanceof Unit && target.hasAbility(fourCC("BIhm"))) {
            target.health += 0.65 * amount // TODO
        } else {
            target.health += amount
        }
    }

    public useItem(item: Item): boolean {
        return UnitUseItem(this.handle, item.handle)
    }

    public issueImmediateOrder(order: number): boolean {
        return IssueImmediateOrderById(this.handle, order)
    }

    public issuePointOrder(order: number, x: number, y: number): boolean {
        return IssuePointOrderById(this.handle, order, x, y)
    }

    public issueTargetOrder(order: number, target: Destructable | Item | Unit): boolean {
        return IssueTargetOrderById(this.handle, order, target.handle)
    }

    public queueImmediateOrder(order: number): boolean {
        return BlzQueueImmediateOrderById(this.handle, order)
    }

    public queuePointOrder(order: number, x: number, y: number): boolean {
        return BlzQueuePointOrderById(this.handle, order, x, y)
    }

    public queueTargetOrder(order: number, target: Destructable | Item | Unit): boolean {
        return BlzQueueTargetOrderById(this.handle, order, target.handle)
    }

    public addItem(item: Item): boolean {
        return UnitAddItem(this.handle, item.handle)
    }

    public dropItemTarget(item: Item, target: Widget): boolean {
        return UnitDropItemTarget(this.handle, item.handle, target.handle)
    }

    public dropItemSlot(item: Item, slot: number): boolean {
        return UnitDropItemSlot(this.handle, item.handle, slot)
    }

    public itemInSlot(slot: number): Item | null {
        return Item.of(unitItemInSlot(this.handle, slot))
    }

    public addAbility(abilityId: number): UnitAbility | undefined {
        return doUnitAbilityAction(
            this.handle,
            abilityId as AbilityTypeId,
            addAbility,
            this,
            abilityId as AbilityTypeId,
        )
    }

    public makeAbilityPermanent(abilityId: number, permanent: true): boolean {
        return UnitMakeAbilityPermanent(this.handle, permanent, abilityId)
    }

    public setAbilityLevel(abilityId: number, level: number): number {
        return SetUnitAbilityLevel(this.handle, abilityId, level)
    }

    public getAbilityLevel(abilityId: number): number {
        return getUnitAbilityLevel(this.handle, abilityId)
    }

    public hasAbility(abilityId: number): boolean {
        return getUnitAbilityLevel(this.handle, abilityId) > 0
    }

    public getAbilityById(abilityId: number): UnitAbility | undefined {
        return doUnitAbilityAction(
            this.handle,
            abilityId as AbilityTypeId,
            getAbility,
            this,
            abilityId as AbilityTypeId,
        )
    }

    public removeAbility(abilityId: number): boolean {
        return doUnitAbilityAction(
            this.handle,
            abilityId as AbilityTypeId,
            removeAbility,
            this,
            abilityId as AbilityTypeId,
        )
    }

    public hideAbility(abilityId: number, flag: boolean): void {
        BlzUnitHideAbility(this.handle, abilityId, flag)
    }

    public getAbilityRemainingCooldown(abilityId: number): number {
        return BlzGetUnitAbilityCooldownRemaining(this.handle, abilityId)
    }

    public startAbilityCooldown(abilityId: number, cooldown: number): void {
        BlzStartUnitAbilityCooldown(this.handle, abilityId, cooldown)
    }

    public endAbilityCooldown(abilityId: number): void {
        BlzEndUnitAbilityCooldown(this.handle, abilityId)
    }

    public interruptMovement(): void {
        const handle = this.handle
        unitDisableAbility(handle, fourCC("Amov"), true, false)
        unitDisableAbility(handle, fourCC("Amov"), false, false)
    }

    public interruptAttack(): void {
        unitInterruptAttack(this.handle)
    }

    public interruptCast(abilityId: number): void {
        const handle = this.handle
        unitDisableAbility(handle, abilityId, true, false)
        Timer.run(unitDisableAbility, handle, abilityId, false, false)
    }

    public getDistanceTo(target: Unit | Vec2): number {
        const handle = this.handle
        const targetHandle = (target as { handle?: junit }).handle
        if (targetHandle) {
            const dx = getUnitX(targetHandle) - getUnitX(handle)
            const dy = getUnitY(targetHandle) - getUnitY(handle)
            return sqrt(dx * dx + dy * dy)
        } else {
            const dx = target.x - getUnitX(handle)
            const dy = target.y - getUnitY(handle)
            return sqrt(dx * dx + dy * dy)
        }
    }

    public getCollisionDistanceTo(...target: [Unit] | [targetX: number, targetY: number]): number

    public getCollisionDistanceTo(targetUnitOrX: Unit | number, targetY?: number): number {
        const handle = this.handle
        if (targetY == undefined) {
            const targetHandle = (targetUnitOrX as Unit).handle
            const dx = getUnitX(targetHandle) - getUnitX(handle)
            const dy = getUnitY(targetHandle) - getUnitY(handle)
            return max(
                0,
                sqrt(dx * dx + dy * dy) -
                    getUnitCollisionSize(targetHandle) -
                    getUnitCollisionSize(handle),
            )
        } else {
            const dx = (targetUnitOrX as number) - getUnitX(handle)
            const dy = targetY - getUnitY(handle)
            return max(0, sqrt(dx * dx + dy * dy) - getUnitCollisionSize(handle))
        }
    }

    public get buffIds(): number[] {
        const buffIds: number[] = []
        let buffIdsCount = 0
        const handle = this.handle
        for (
            let i = 0, ability = getUnitAbilityByIndex(handle, i);
            ability != undefined;
            i++, ability = getUnitAbilityByIndex(handle, i)
        ) {
            const abilityId = getAbilityId(ability)
            if (getAbilityName(abilityId) == "Default string" && abilityId != fourCC("Atrg")) {
                buffIdsCount++
                buffIds[buffIdsCount - 1] = abilityId
            }
        }
        return buffIds
    }

    public resetCooldown(): void {
        UnitResetCooldown(this.handle)
    }

    public incrementDisableAutoAttackCounter(): void {
        unitDisableAbility(this.handle, fourCC("Aatk"), true, false)
    }

    public decrementDisableAutoAttackCounter(): void {
        unitDisableAbility(this.handle, fourCC("Aatk"), false, false)
    }

    /** @deprecated Use incrementStunCounter. */
    public pauseEx(): void {
        this.incrementStunCounter()
    }

    /** @deprecated Use decrementStunCounter. */
    public unpauseEx(): void {
        this.decrementStunCounter()
    }

    public incrementStunCounter(): void {
        const stunCounter = this[UnitPropertyKey.STUN_COUNTER] ?? 0
        if (!this[UnitPropertyKey.IS_PAUSED] || stunCounter >= 0) {
            BlzPauseUnitEx(this.handle, true)
        }
        this[UnitPropertyKey.STUN_COUNTER] = stunCounter + 1
    }

    public decrementStunCounter(): void {
        const stunCounter = this[UnitPropertyKey.STUN_COUNTER] ?? 0
        if (!this[UnitPropertyKey.IS_PAUSED] || stunCounter >= 1) {
            BlzPauseUnitEx(this.handle, false)
        }
        this[UnitPropertyKey.STUN_COUNTER] = stunCounter - 1
    }

    public set waygateActive(v: boolean) {
        WaygateActivate(this.handle, v)
    }

    public get waygateActive(): boolean {
        return WaygateIsActive(this.handle)
    }

    public set waygateDestination(v: Vec2) {
        WaygateSetDestination(this.handle, v.x, v.y)
    }

    public get waygateDestination(): Vec2 {
        return vec2(WaygateGetDestinationX(this.handle), WaygateGetDestinationY(this.handle))
    }

    public get abilities(): ReadonlyArray<UnitAbility> {
        const abilities: UnitAbility[] = []
        const stock = stockAbilities[this.typeId]
        if (stock) {
            const handle = this.handle
            let j = 1
            for (const i of $range(1, stock.length)) {
                const abilityId = stock[i - 1]
                const ability = UnitAbility.of(getUnitAbility(handle, abilityId), abilityId, this)
                if (ability) {
                    abilities[j - 1] = ability
                    ++j
                }
            }
        }
        rawset(this, "abilities", abilities)
        return abilities
    }

    public get onUnitInRange(): Record<number, Event<[Unit]>> {
        const handle = this.handle
        const onUnitInRange = setmetatable(new LuaTable<number, Event<[Unit]>>(), {
            __index(value: number): Event<[Unit]> {
                const event = new TriggerEvent(
                    (trigger) => {
                        TriggerRegisterUnitInRangeSimple(trigger, value, handle)
                    },
                    () => $multi(Unit.of(handle)),
                )
                rawset(this, value, event)
                return event
            },
        })
        rawset(this, "onUnitInRange", onUnitInRange)
        return onUnitInRange
    }

    public get onManaEqual(): Record<number, Event<[Unit, number]>> {
        const handle = this.handle
        const onManaEqual = setmetatable(new LuaTable<number, Event<[Unit, number]>>(), {
            __index(value: number): Event<[Unit, number]> {
                const event = new TriggerEvent(
                    (trigger) => {
                        TriggerRegisterUnitManaEvent(trigger, handle, EQUAL, value)
                    },
                    () => $multi(Unit.of(handle), value),
                )
                rawset(this, value, event)
                return event
            },
        })
        rawset(this, "onManaEqual", onManaEqual)
        return onManaEqual
    }

    public get manaEvent(): Record<Operator, Record<number, Event<[Unit]>>> {
        const unit = this

        const eventByValueByOperator = setmetatable(
            {} as Record<Operator, Record<number, Event<[Unit]>>>,
            {
                __index(operator: Operator): Record<number, Event<[Unit]>> {
                    const eventByValue = setmetatable({} as Record<number, Event<[Unit]>>, {
                        __index(value: number): Event<[Unit]> {
                            let actualValue = value
                            if (operator == Operator.GREATER_THAN) {
                                actualValue = value + 0.01
                            } else if (operator == Operator.LESS_THAN) {
                                actualValue = value - 0.01
                            }

                            const event = new TriggerEvent(
                                (trigger) => {
                                    TriggerRegisterUnitManaEvent(
                                        trigger,
                                        unit.handle,
                                        jlimitopByOperator[operator],
                                        actualValue,
                                    )
                                },
                                () => $multi(unit),
                            )

                            let eventsToDestroy = unit._eventsToDestroy
                            if (eventsToDestroy == undefined) {
                                eventsToDestroy = []
                                unit._eventsToDestroy = eventsToDestroy
                            }
                            eventsToDestroy[eventsToDestroy.length] = event

                            rawset(this, value, event)

                            return event
                        },
                    })

                    rawset(this, operator, eventByValue)

                    return eventByValue
                },
            },
        )

        rawset(this, "manaEvent", eventByValueByOperator)

        return eventByValueByOperator
    }

    public get targetAcquiredEvent(): Event {
        return this.getEvent(EVENT_UNIT_ACQUIRED_TARGET)
    }

    public get onSelect(): Event {
        return this.getEvent(EVENT_UNIT_SELECTED)
    }

    public get onDeselect(): Event {
        return this.getEvent(EVENT_UNIT_DESELECTED)
    }

    public get onImmediateOrder(): Event<[number]> {
        return this.getEvent(EVENT_UNIT_ISSUED_ORDER, () => $multi(GetIssuedOrderId()))
    }

    public get onPointOrder(): Event<[number]> {
        return this.getEvent(EVENT_UNIT_ISSUED_POINT_ORDER, () => $multi(GetIssuedOrderId()))
    }

    public get onTargetOrder(): Event<[number, Unit | Item | Destructable]> {
        return this.getEvent(EVENT_UNIT_ISSUED_TARGET_ORDER, () =>
            $multi(
                GetIssuedOrderId(),
                Unit.of(GetOrderTargetUnit()) ??
                    Item.of(GetOrderTargetItem()) ??
                    checkNotNull(Destructable.of(GetOrderTargetDestructable())),
            ),
        )
    }

    public get onSpellEffect(): Event<[number]> {
        return this.getEvent(EVENT_UNIT_SPELL_EFFECT, () => $multi(GetSpellAbilityId()))
    }

    public static create<T extends Unit>(
        this: typeof Unit & (new (handle: junit) => T),
        owner: Player,
        id: number,
        x: number,
        y: number,
        facing: number,
        skinId?: number,
    ): T | null {
        const handle = skinId
            ? BlzCreateUnitWithSkin(owner.handle, id, x, y, facing, skinId)
            : CreateUnit(owner.handle, id, x, y, facing)
        return handle && this.of(handle)
    }

    public static forAll(consumer: (unit: Unit) => any): void {
        message = undefined
        gConsumer = consumer
        groupEnumUnitsInRange(dummyGroup, 0, 0, 999999, invokeConsumer)
        if (message) {
            error(message)
        }
    }

    public static getAll(predicate?: (unit: Unit) => boolean): Unit[] {
        targetCollection = []
        targetCollectionNextIndex = 1
        enumPredicate = predicate
        const collect = predicate ? collectIntoTargetWithPredicate : collectIntoTarget
        for (const player of Player.all) {
            groupEnumUnitsOfPlayer(dummyGroup, player.handle, collect)
        }
        return targetCollection
    }

    public static getOwnedBy(player: Player, predicate?: (unit: Unit) => boolean): Unit[] {
        targetCollection = []
        targetCollectionNextIndex = 1
        enumPredicate = predicate
        groupEnumUnitsOfPlayer(
            dummyGroup,
            player.handle,
            predicate ? collectIntoTargetWithPredicate : collectIntoTarget,
        )
        return targetCollection
    }

    public static getInRect(rect: ReadonlyRect, predicate?: (unit: Unit) => boolean): Unit[] {
        targetCollection = []
        targetCollectionNextIndex = 1
        enumPredicate = predicate
        groupEnumUnitsInRect(
            dummyGroup,
            rect.handle,
            predicate ? collectIntoTargetWithPredicate : collectIntoTarget,
        )
        return targetCollection
    }

    public static getInRange(
        x: number,
        y: number,
        range: number,
        predicate?: (unit: Unit) => boolean,
    ): Unit[] {
        targetCollection = []
        targetCollectionNextIndex = 1
        enumPredicate = predicate
        groupEnumUnitsInRange(
            dummyGroup,
            x,
            y,
            range,
            predicate ? collectIntoTargetWithPredicate : collectIntoTarget,
        )
        return targetCollection
    }

    public static getInCollisionRange(
        x: number,
        y: number,
        range: number,
        predicate?: (unit: Unit) => boolean,
    ): Unit[] {
        targetCollection = []
        targetCollectionNextIndex = 1
        centerX = x
        centerY = y
        enumRange = range
        enumPredicate = predicate
        groupEnumUnitsInRange(
            dummyGroup,
            centerX,
            centerY,
            range + 256,
            predicate ? collectIntoTargetCollisionWithPredicate : collectIntoTargetCollision,
        )
        return targetCollection
    }

    public static getInSector(
        pos: Vec2,
        range: number,
        offsetAngle: number,
        centralAngle: number,
    ): Unit[] {
        posX = pos.x
        posY = pos.y
        startAngle = deg2rad(offsetAngle)
        centerAngle = deg2rad(centralAngle)
        targetCollection = []
        targetCollectionNextIndex = 1
        groupEnumUnitsInRange(dummyGroup, pos.x, pos.y, range, collectSectorIntoTarget)
        return targetCollection
    }

    public static getSelectionOf(player: Player, target: Unit[] = []): Unit[] {
        targetCollection = target
        targetCollectionNextIndex = 1
        GroupEnumUnitsSelected(dummyGroup, player.handle, collectIntoTarget)
        return targetCollection
    }

    /*public static forSelectionOf<Args extends []>(
        player: Player,
        action: (unit: Unit, ...args: Args) => void,
        ...args: Args
    ): void {
        const argsCount = select("#", ...args)
        for (const i of $range(1, argsCount)) {
            // save dem
            select(i, ...args)
        }
        // do job
        for (const i of $range(1, argsCount)) {
            // null captures
        }
    }*/

    public static readonly deathEvent = new UnitTriggerEvent(EVENT_PLAYER_UNIT_DEATH, () =>
        $multi(Unit.of(GetDyingUnit()), Unit.of(GetKillingUnit())),
    )

    public static readonly onDecay = new UnitTriggerEvent(EVENT_PLAYER_UNIT_DECAY, () =>
        $multi(Unit.of(GetDecayingUnit())),
    )

    public static readonly onResurrect = new InitializingEvent<[Unit]>((event) => {
        const dead = setmetatable(new LuaTable<Unit, boolean | undefined>(), { __mode: "k" })
        Unit.deathEvent.addListener((unit) => {
            dead.set(unit, true)
        })
        Unit.onImmediateOrder[orderId("undefend")].addListener((unit) => {
            if (dead.get(unit) && !IsUnitType(unit.handle, UNIT_TYPE_DEAD)) {
                dead.set(unit, false)
                invoke(event, unit)
            }
        })
    })

    public static readonly morphEvent = new InitializingEvent<[Unit]>((event) => {
        const ifNotLeft = (unit: Unit) => {
            const handle = unit.handle
            if (
                getUnitAbilityLevel(handle, leaveDetectAbilityId) != 0 &&
                unitAddAbility(handle, morphDetectAbilityId)
            ) {
                invoke(event, unit)
            }
        }
        Unit.onImmediateOrder[orderId("undefend")].addListener((unit) => {
            if (getUnitAbilityLevel(unit.handle, morphDetectAbilityId) == 0) {
                Timer.run(ifNotLeft, unit)
            }
        })
    })

    public static readonly onOwnerChange = new UnitTriggerEvent(
        EVENT_PLAYER_UNIT_CHANGE_OWNER,
        () => $multi(Unit.of(GetChangingUnit()), Player.of(GetChangingUnitPrevOwner())),
    )

    public static readonly onSelect = new UnitTriggerEvent(EVENT_PLAYER_UNIT_SELECTED, () =>
        $multi(Unit.of(getTriggerUnit()!), Player.of(getTriggerPlayer())),
    )

    public static readonly onDeselect = new UnitTriggerEvent(EVENT_PLAYER_UNIT_DESELECTED, () =>
        $multi(Unit.of(getTriggerUnit()!), Player.of(getTriggerPlayer())),
    )

    public static readonly constructionStartEvent = new UnitTriggerEvent(
        EVENT_PLAYER_UNIT_CONSTRUCT_START,
        () => $multi(Unit.of(GetConstructingStructure())),
    )

    public static readonly onUpgradeFinish = new UnitTriggerEvent(
        EVENT_PLAYER_UNIT_UPGRADE_FINISH,
        () => $multi(Unit.of(getTriggerUnit()!)),
    )

    public static readonly onSpellEffect = dispatchId(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_SPELL_EFFECT, () =>
            $multi(Unit.of(GetTriggerUnit()!), GetSpellAbilityId()),
        ),
    )

    public static readonly onTargetCast = dispatchId(
        new InitializingEvent<
            [Unit, number, Unit | Item | Destructable],
            EventListener<[Unit, number]>
        >(
            (event) => {
                const listener = (unit: Unit, id: number) => {
                    const target = GetSpellTargetUnit()
                        ? Unit.of(GetSpellTargetUnit())
                        : GetSpellTargetItem()
                          ? Item.of(GetSpellTargetItem())
                          : GetSpellTargetDestructable()
                            ? Destructable.of(GetSpellTargetDestructable())
                            : undefined
                    if (target) {
                        invoke(event, unit, id, target)
                    }
                }
                Unit.onSpellEffect.addListener(listener)
                return listener
            },
            (listener) => {
                Unit.onSpellEffect.removeListener(listener)
            },
        ),
    )

    public static readonly onCastPrepare = dispatchAbility(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_SPELL_CHANNEL, () => {
            const unit = getTriggerUnit()!
            return $multi(
                Unit.of(unit),
                retrieveAbility(unit, getSpellAbility(), getSpellAbilityId()),
            )
        }),
    )

    public static readonly onCast = dispatchAbility(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_SPELL_EFFECT, () => {
            const unit = getTriggerUnit()!
            return $multi(
                Unit.of(unit),
                retrieveAbility(unit, getSpellAbility(), getSpellAbilityId()),
            )
        }),
    )

    public static readonly onPointCastPrepare = dispatchAbility(
        new InitializingEvent<[Unit, Ability, number, number], EventListener<[Unit, Ability]>>(
            (event) => {
                const listener = (unit: Unit, ability: Ability) => {
                    const x = getSpellTargetX()
                    const y = getSpellTargetY()
                    if (x != 0 || y != 0) {
                        invoke(event, unit, ability, x, y)
                    }
                }
                Unit.onCastPrepare.addListener(listener)
                return listener
            },
            (listener) => {
                Unit.onCastPrepare.removeListener(listener)
            },
        ),
    )

    public static readonly onUnitTargetCastPrepare = dispatchAbility(
        new InitializingEvent<[Unit, Ability, Unit], EventListener<[Unit, Ability]>>(
            (event) => {
                const listener = (unit: Unit, ability: Ability) => {
                    const target = Unit.of(getSpellTargetUnit())
                    if (target) {
                        invoke(event, unit, ability, target)
                    }
                }
                Unit.onCastPrepare.addListener(listener)
                return listener
            },
            (listener) => {
                Unit.onCastPrepare.removeListener(listener)
            },
        ),
    )

    public static readonly onUnitTargetCast = dispatchAbility(
        new InitializingEvent<[Unit, Ability, Unit], EventListener<[Unit, Ability]>>(
            (event) => {
                const listener = (unit: Unit, ability: Ability) => {
                    const target = Unit.of(getSpellTargetUnit())
                    if (target) {
                        invoke(event, unit, ability, target)
                    }
                }
                Unit.onCast.addListener(listener)
                return listener
            },
            (listener) => {
                Unit.onCast.removeListener(listener)
            },
        ),
    )

    public static readonly onPointCast = dispatchAbility(
        new InitializingEvent<[Unit, Ability, number, number], EventListener<[Unit, Ability]>>(
            (event) => {
                const listener = (unit: Unit, ability: Ability) => {
                    if (
                        !(
                            getSpellTargetUnit() ||
                            getSpellTargetItem() ||
                            getSpellTargetDestructable()
                        )
                    ) {
                        const x = getSpellTargetX()
                        const y = getSpellTargetY()
                        if (x != 0 || y != 0) {
                            invoke(event, unit, ability, x, y)
                        }
                    }
                }
                Unit.onCast.addListener(listener)
                return listener
            },
            (listener) => {
                Unit.onCast.removeListener(listener)
            },
        ),
    )

    public static readonly onCastStart = dispatchAbility(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_SPELL_CAST, () => {
            const unit = getTriggerUnit()!
            return $multi(
                Unit.of(unit),
                retrieveAbility(unit, getSpellAbility(), getSpellAbilityId()),
            )
        }),
    )

    public static readonly onUnitTargetCastStart = dispatchAbility(
        new InitializingEvent<[Unit, Ability, Unit], EventListener<[Unit, Ability]>>(
            (event) => {
                const listener = (unit: Unit, ability: Ability) => {
                    const target = Unit.of(getSpellTargetUnit())
                    if (target) {
                        invoke(event, unit, ability, target)
                    }
                }
                Unit.onCastStart.addListener(listener)
                return listener
            },
            (listener) => {
                Unit.onCastStart.removeListener(listener)
            },
        ),
    )

    public static readonly onCastFinish = dispatchAbility(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_SPELL_FINISH, () => {
            const unit = getTriggerUnit()!
            return $multi(
                Unit.of(unit),
                retrieveAbility(unit, getSpellAbility(), getSpellAbilityId()),
            )
        }),
    )

    public static readonly onCastStop = dispatchAbility(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_SPELL_ENDCAST, () => {
            const unit = getTriggerUnit()!
            return $multi(
                Unit.of(unit),
                retrieveAbility(unit, getSpellAbility(), getSpellAbilityId()),
            )
        }),
    )

    public static readonly onImmediateOrder = dispatchId(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_ISSUED_ORDER, () => {
            const handle = getOrderedUnit()
            if (handle != undefined && getUnitTypeId(handle) != dummyUnitId) {
                const unit = Unit.of(handle)
                if (unit.state == HandleState.CREATED) {
                    return $multi(unit, getIssuedOrderId())
                }
            }
            return $multi(IgnoreEvent)
        }),
    )

    public static readonly onTargetOrder: EventDispatcher<
        [Unit, number, Unit | Destructable | Item],
        [Unit, Unit | Destructable | Item]
    > = dispatchId(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER, () =>
            $multi(
                Unit.of(GetOrderedUnit()),
                GetIssuedOrderId(),
                Unit.of(GetOrderTargetUnit()) ??
                    Item.of(GetOrderTargetItem()) ??
                    checkNotNull(Destructable.of(GetOrderTargetDestructable())),
            ),
        ),
    )

    public static readonly onPointOrder = dispatchId(
        new UnitTriggerEvent(EVENT_PLAYER_UNIT_ISSUED_POINT_ORDER, () =>
            $multi(
                Unit.of(GetOrderedUnit()),
                GetIssuedOrderId(),
                GetOrderPointX(),
                GetOrderPointY(),
            ),
        ),
    )

    public static readonly autoAttackStartEvent = new UnitTriggerEvent<[Unit]>(
        EVENT_PLAYER_UNIT_ATTACKED,
        () => $multi(Unit.of(GetAttacker()), Unit.of(GetTriggerUnit()!)),
    )

    public static readonly onDamaging = (() => {
        const event = new Event<[source: Unit | undefined, target: Unit, event: DamagingEvent]>()
        const trigger = CreateTrigger()
        TriggerRegisterAnyUnitEventBJ(trigger, EVENT_PLAYER_UNIT_DAMAGING)
        TriggerAddCondition(
            trigger,
            Condition(
                warpack.wrapSafeCall(() => {
                    let source = Unit.of(GetEventDamageSource())
                    if (source && source.typeId == dummyUnitId) {
                        source = undefined
                    }
                    const target = Unit.of(BlzGetEventDamageTarget())
                    const metadata = damageMetadataByTarget.get(target)
                    damageMetadataByTarget.delete(target)
                    const data = {
                        amount: GetEventDamage(),
                        attackType: nativeToAttackType(BlzGetEventAttackType()),
                        damageType: BlzGetEventDamageType(),
                        weaponType: BlzGetEventWeaponType(),
                        metadata: metadata,
                        isAttack: BlzGetEventIsAttack(),
                        originalAmount: GetEventDamage(),
                        originalMetadata: metadata,

                        preventRetaliation: damagingEventPreventRetaliation,
                    } as InternalDamagingEvent & {
                        weapon?: UnitWeapon
                    }
                    if (data.isAttack && source) {
                        let weapon = BlzGetUnitWeaponBooleanField(
                            source.handle,
                            UNIT_WEAPON_BF_ATTACKS_ENABLED,
                            1,
                        )
                            ? BlzGetUnitWeaponBooleanField(
                                  source.handle,
                                  UNIT_WEAPON_BF_ATTACKS_ENABLED,
                                  0,
                              )
                                ? -1
                                : 1
                            : 0
                        if (weapon == -1) {
                            const targetsAllowed = BlzGetUnitWeaponIntegerField(
                                source.handle,
                                UNIT_WEAPON_IF_ATTACK_TARGETS_ALLOWED,
                                0,
                            )
                            // TODO: deduce weapon based on targets allowed
                            weapon = 0
                        }
                        data.weapon = assert(source.weapons[weapon])
                    }
                    if (!data.isAttack || !source || !source._attackHandlers) {
                        invoke(
                            event,
                            source,
                            target,
                            setmetatable<{}, DamagingEvent>(
                                {},
                                {
                                    __index: data,
                                    __newindex(key: keyof typeof damageSetters, value: never) {
                                        const damageSetter = damageSetters[key]
                                        if (damageSetter != undefined) {
                                            damageSetter(value)
                                        }
                                        data[key] = value
                                    },
                                },
                            ),
                        )
                        if (data[DamagingEventPropertyKey.SHOULD_PREVENT_RETALIATION] && source) {
                            const sourceOwner = source.owner.handle
                            data[DamagingEventPropertyKey.RETALIATION_PREVENTION_SOURCE_OWNER] =
                                sourceOwner
                            const targetOwner = target.owner.handle
                            data[DamagingEventPropertyKey.RETALIATION_PREVENTION_TARGET_OWNER] =
                                targetOwner
                            if (!GetPlayerAlliance(sourceOwner, targetOwner, ALLIANCE_PASSIVE)) {
                                SetPlayerAlliance(sourceOwner, targetOwner, ALLIANCE_PASSIVE, true)
                                data[
                                    DamagingEventPropertyKey.RETALIATION_PREVENTION_SOURCE_TO_TARGET
                                ] = true
                            }
                            if (!GetPlayerAlliance(targetOwner, sourceOwner, ALLIANCE_PASSIVE)) {
                                SetPlayerAlliance(targetOwner, sourceOwner, ALLIANCE_PASSIVE, true)
                                data[
                                    DamagingEventPropertyKey.RETALIATION_PREVENTION_TARGET_TO_SOURCE
                                ] = true
                            }
                        }
                        damagingEventByTarget.set(target, data)
                        return
                    }
                    BlzSetEventDamage(0)
                    BlzSetEventAttackType(ATTACK_TYPE_NORMAL)
                    BlzSetEventDamageType(DAMAGE_TYPE_UNKNOWN)
                    BlzSetEventWeaponType(WEAPON_TYPE_WHOKNOWS)
                    const sourceOwner = source.owner.handle
                    const targetOwner = target.owner.handle
                    // TODO: remove copypaste (look above)
                    if (!GetPlayerAlliance(sourceOwner, targetOwner, ALLIANCE_PASSIVE)) {
                        SetPlayerAlliance(sourceOwner, targetOwner, ALLIANCE_PASSIVE, true)
                        Timer.run(() => {
                            SetPlayerAlliance(sourceOwner, targetOwner, ALLIANCE_PASSIVE, false)
                        })
                    }
                    if (!GetPlayerAlliance(targetOwner, sourceOwner, ALLIANCE_PASSIVE)) {
                        SetPlayerAlliance(targetOwner, sourceOwner, ALLIANCE_PASSIVE, true)
                        Timer.run(() => {
                            SetPlayerAlliance(targetOwner, sourceOwner, ALLIANCE_PASSIVE, false)
                        })
                    }
                    for (const [condition, action] of source._attackHandlers) {
                        if (condition(source, target, data as AttackDamageEvent)) {
                            action(
                                source,
                                target,
                                setmetatable<{ fire(this: void): void }, AttackDamageEvent>(
                                    {
                                        fire() {
                                            UnitDamageTarget(
                                                source!.handle,
                                                target.handle,
                                                data.amount,
                                                true,
                                                true,
                                                attackTypeToNative(data.attackType),
                                                data.damageType,
                                                data.weaponType,
                                            )
                                        },
                                    },
                                    {
                                        __index: data as AttackDamageEvent,
                                        __newindex: data,
                                    },
                                ),
                            )
                            return
                        }
                    }
                }),
            ),
        )
        return event
    })()

    public static readonly onDamage = new InitializingEvent<
        [source: Unit | undefined, target: Unit, event: DamageEvent],
        jtrigger
    >(
        (event) => {
            const trigger = CreateTrigger()
            TriggerRegisterAnyUnitEventBJ(trigger, EVENT_PLAYER_UNIT_DAMAGED)
            TriggerAddCondition(
                trigger,
                Condition(
                    warpack.wrapSafeCall(() => {
                        let source = Unit.of(GetEventDamageSource())
                        if (source && source.typeId == dummyUnitId) {
                            source = undefined
                        }
                        const target = Unit.of(BlzGetEventDamageTarget())
                        const damagingEvent = damagingEventByTarget.get(target)
                        damagingEventByTarget.delete(target)
                        const data = {
                            amount: GetEventDamage(),
                            attackType: nativeToAttackType(BlzGetEventAttackType()),
                            damageType: BlzGetEventDamageType(),
                            weaponType: BlzGetEventWeaponType(),
                            metadata: damagingEvent?.metadata,
                            isAttack: BlzGetEventIsAttack(),
                            originalAmount: damagingEvent?.originalAmount ?? GetEventDamage(),
                            originalMetadata: damagingEvent?.originalMetadata,

                            preventDeath: damageEventPreventDeath,
                        } as InternalDamageEvent
                        if (damagingEvent) {
                            for (const [key, value] of pairs(damagingEvent)) {
                                if (isAttribute(key)) {
                                    data.set(key, value)
                                }
                            }
                            const sourceOwner =
                                damagingEvent[
                                    DamagingEventPropertyKey.RETALIATION_PREVENTION_SOURCE_OWNER
                                ]
                            if (sourceOwner) {
                                const targetOwner =
                                    damagingEvent[
                                        DamagingEventPropertyKey.RETALIATION_PREVENTION_TARGET_OWNER
                                    ]!
                                if (
                                    damagingEvent[
                                        DamagingEventPropertyKey
                                            .RETALIATION_PREVENTION_SOURCE_TO_TARGET
                                    ]
                                ) {
                                    SetPlayerAlliance(
                                        sourceOwner,
                                        targetOwner,
                                        ALLIANCE_PASSIVE,
                                        false,
                                    )
                                }
                                if (
                                    damagingEvent[
                                        DamagingEventPropertyKey
                                            .RETALIATION_PREVENTION_TARGET_TO_SOURCE
                                    ]
                                ) {
                                    SetPlayerAlliance(
                                        targetOwner,
                                        sourceOwner,
                                        ALLIANCE_PASSIVE,
                                        false,
                                    )
                                }
                            }
                        }
                        const evData = setmetatable(
                            {},
                            {
                                __index: data,
                                __newindex(key: keyof typeof damageSetters, value: never) {
                                    const damageSetter = damageSetters[key]
                                    if (damageSetter != undefined) {
                                        damageSetter(value)
                                    }
                                    data[key] = value
                                },
                            },
                        )
                        invoke(event, source, target, evData)
                        if (
                            evData[DamageEventPropertyKey.PREVENT_DEATH_CALLBACK] != undefined &&
                            target.health - evData.amount < 0.405
                        ) {
                            const bonusHealth = math.ceil(evData.amount)
                            target[UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS] =
                                (target[UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS] ?? 0) +
                                bonusHealth
                            BlzSetUnitMaxHP(
                                target.handle,
                                BlzGetUnitMaxHP(target.handle) + bonusHealth,
                            )
                            SetWidgetLife(target.handle, GetWidgetLife(target.handle) + bonusHealth)
                            Timer.run(() => {
                                warpack.safeCall(
                                    evData[DamageEventPropertyKey.PREVENT_DEATH_CALLBACK]!,
                                    ...table.unpack(
                                        evData as unknown as any[],
                                        DamageEventPropertyKey.PREVENT_DEATH_PARAMETERS_LENGTH + 1,
                                        DamageEventPropertyKey.PREVENT_DEATH_PARAMETERS_LENGTH +
                                            (evData[
                                                DamageEventPropertyKey
                                                    .PREVENT_DEATH_PARAMETERS_LENGTH
                                            ] ?? 0),
                                    ),
                                )
                                target[UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS] =
                                    (target[UnitPropertyKey.PREVENT_DEATH_HEALTH_BONUS] ?? 0) -
                                    bonusHealth
                                SetWidgetLife(
                                    target.handle,
                                    GetWidgetLife(target.handle) - bonusHealth,
                                )
                                BlzSetUnitMaxHP(
                                    target.handle,
                                    BlzGetUnitMaxHP(target.handle) - bonusHealth,
                                )
                            })
                        }
                    }),
                ),
            )
            return trigger
        },
        (trigger) => {
            TriggerClearConditions(trigger)
            DestroyTrigger(trigger)
        },
    )

    public static itemDroppedEvent = new UnitTriggerEvent(EVENT_PLAYER_UNIT_DROP_ITEM, () => {
        const unit = getTriggerUnit()
        const item = getManipulatedItem()
        if (getUnitTypeId(unit!) != dummyUnitId && !ignoreEventsItems.has(item)) {
            return $multi(Unit.of(unit!), Item.of(item!))
        }
        return $multi(IgnoreEvent)
    })

    public static itemPickedUpEvent = new UnitTriggerEvent(EVENT_PLAYER_UNIT_PICKUP_ITEM, () => {
        const unit = getTriggerUnit()
        const item = getManipulatedItem()
        if (getUnitTypeId(unit!) != dummyUnitId && !ignoreEventsItems.has(item)) {
            return $multi(Unit.of(unit!), Item.of(item!))
        }
        return $multi(IgnoreEvent)
    })

    public static itemUsedEvent = new UnitTriggerEvent(EVENT_PLAYER_UNIT_USE_ITEM, () => {
        const unit = getTriggerUnit()
        const item = getManipulatedItem()
        if (getUnitTypeId(unit!) != dummyUnitId && !ignoreEventsItems.has(item)) {
            return $multi(Unit.of(unit!), Item.of(item!))
        }
        return $multi(IgnoreEvent)
    })

    public static itemStackedEvent = new UnitTriggerEvent(EVENT_PLAYER_UNIT_STACK_ITEM, () =>
        $multi(Unit.of(getTriggerUnit()!), Item.of(getManipulatedItem()!)),
    )

    public static get itemChargesChangedEvent(): Event<[unit: Unit, item: Item]> {
        const event = new Event<[Unit, Item]>()
        Item.chargesChangedEvent.addListener((item) => {
            const unit = item.owner
            if (unit !== undefined) {
                invoke(event, unit, item)
            }
        })
        rawset(this, "itemChargesChangedEvent", event)
        return event
    }

    public static get itemUseOrderEvent(): Event<[unit: Unit, item: Item]> {
        const event = new Event<[Unit, Item]>()
        for (const order of $range(orderId("useslot0"), orderId("useslot5"))) {
            const slot = (order - orderId("useslot0")) as 0 | 1 | 2 | 3 | 4 | 5
            const listener = (unit: Unit) => {
                const item = unit.items[slot]
                if (item !== undefined) {
                    invoke(event, unit, item)
                }
            }
            this.onImmediateOrder[order].addListener(listener)
            this.onTargetOrder[order].addListener(listener)
            this.onPointOrder[order].addListener(listener)
        }
        rawset(this, "itemUseOrderEvent", event)
        return event
    }

    public static get itemMoveOrderEvent(): Event<
        [unit: Unit, item: Item, slotFrom: 0 | 1 | 2 | 3 | 4 | 5, slotTo: 0 | 1 | 2 | 3 | 4 | 5]
    > {
        const event = new Event<[Unit, Item, 0 | 1 | 2 | 3 | 4 | 5, 0 | 1 | 2 | 3 | 4 | 5]>()
        for (const order of $range(orderId("moveslot0"), orderId("moveslot5"))) {
            const slotTo = (order - orderId("moveslot0")) as 0 | 1 | 2 | 3 | 4 | 5
            this.onTargetOrder[order].addListener((unit, item) => {
                const slotFrom = unit.items.findSlot(item as Item)
                if (slotFrom !== undefined) {
                    invoke(event, unit, item, slotFrom, slotTo)
                }
            })
        }
        rawset(this, "itemMoveOrderEvent", event)
        return event
    }

    public static get onCreate(): EventDispatcher<[Unit], [Unit]> {
        const onCreate = dispatch<[Unit], [Unit]>(
            Unit.onCreateEvent,
            (unit) => unit.typeId,
            (unit) => $multi(unit),
        )
        rawset(this, "onCreate", onCreate)
        return onCreate
    }

    public static get destroyEvent(): EventDispatcher<[Unit], [Unit]> {
        const destroyEvent = dispatch<[Unit], [Unit]>(
            Unit.onDestroyEvent,
            (unit) => unit.typeId,
            (unit) => $multi(unit),
        )
        rawset(this, "destroyEvent", destroyEvent)
        return destroyEvent
    }

    public getField(field: junitintegerfield | junitrealfield): number
    public getField(field: junitbooleanfield): boolean
    public getField(field: junitstringfield): string

    public getField(field: junitfield): number | boolean | string {
        const [fieldType] = match(tostring(field), "^(.-):")
        return fieldGetters[fieldType](this, field)
    }

    public setField(field: junitintegerfield, value: number): boolean
    public setField(field: junitrealfield, value: number): boolean
    public setField(field: junitbooleanfield, value: boolean): boolean
    public setField(field: junitstringfield, value: string): boolean

    public setField(field: junitfield, value: number | boolean | string): boolean {
        const [fieldType] = match(tostring(field), "^(.-):")
        return fieldSetters[fieldType](this, field, value)
    }

    public override toString(): string {
        return `${this.constructor.name}$${util.id2s(this.typeId)}@${getHandleId(this.handle)}`
    }

    public static getBySyncId(syncId: UnitSyncId): Unit | undefined {
        return unitBySyncId.get(syncId)
    }

    static {
        const leaveAbilityIds = postcompile(() => {
            const parentLeaveAbilityIds = new Set<string>(["Adef", "Amdf", "AEim", "ACim"])

            const leaveAbilityIds = [...parentLeaveAbilityIds.values()]
            if (currentMap) {
                for (const [id, ability] of pairs(currentMap.objects.ability.all)) {
                    if (ability.parentId && parentLeaveAbilityIds.has(ability.parentId)) {
                        leaveAbilityIds.push(id)
                    }
                }
            }
            return leaveAbilityIds.map((id) => fourCC(id))
        })

        for (const leaveOrderId of [
            orderId("undefend"),
            orderId("magicundefense"),
            orderId("unimmolation"),
        ]) {
            Unit.onImmediateOrder[leaveOrderId].addListener((unit) => {
                const handle = unit.handle
                for (const i of $range(1, leaveAbilityIds.length)) {
                    if (getUnitAbilityLevel(handle, leaveAbilityIds[i - 1]) != 0) {
                        return
                    }
                }
                unit.destroy()
            })
        }
    }
}
