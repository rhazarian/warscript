import { DamageEvent, Unit } from "./internal/unit"
import {
    ApplicableBuffTypeId,
    internalApplyBuff,
    removeBuff,
} from "./object-data/entry/buff-type/applicable"
import { Ability } from "./internal/ability"
import { AbilityTypeId } from "./object-data/entry/ability-type"
import { BuffPolarity } from "./object-data/auxiliary/buff-polarity"
import { BuffResistanceType } from "./object-data/auxiliary/buff-resistance-type"
import {
    AbilityBooleanField,
    AbilityBooleanLevelField,
    AbilityCombatClassificationsLevelField,
    AbilityDependentValue,
    AbilityIntegerField,
    AbilityIntegerLevelField,
    AbilityNumberField,
    AbilityNumberLevelField,
    resolveCurrentAbilityDependentValue,
} from "./object-field/ability"
import { IllegalArgumentException } from "../exception"
import { Timer } from "../core/types/timer"
import { max, min } from "../math"
import {
    addOrUpdateOrRemoveUnitBonus,
    getUnitBonus,
    removeUnitBonus,
    UnitBonusId,
    UnitBonusType,
} from "./internal/unit/bonus"
import { CombatClassifications } from "./object-data/auxiliary/combat-classification"
import { damageArea } from "./internal/mechanics/area-damage"
import { checkNotNull } from "../utility/preconditions"
import { IsExactlyAny, NonEmptyArray, Prohibit } from "../utility/types"
import { Effect } from "../core/types/effect"
import { ObjectFieldId } from "./object-field"
import { BuffType, BuffTypeId } from "./object-data/entry/buff-type"
import { UnitBehavior } from "./behaviour/unit"
import type { Widget } from "../core/types/widget"
import { forEach } from "../utility/arrays"
import { Destructor } from "../destroyable"
import { EventListenerPriority } from "../event"
import { getAbilityDuration } from "./internal/mechanics/ability-duration"

const getUnitAbility = BlzGetUnitAbility

const stringValueByBuffTypeIdByFieldId = postcompile(() => {
    const stringValueByBuffTypeIdByFieldId = new LuaMap<ObjectFieldId, LuaMap<BuffTypeId, string>>()
    for (const rawFieldId of ["feft", "fspt"]) {
        const stringValueByBuffTypeId = new LuaMap<BuffTypeId, string>()

        for (const buffType of BuffType.getAll()) {
            const stringValue = buffType["getStringField"](rawFieldId)
            if (stringValue != "") {
                stringValueByBuffTypeId.set(buffType.id, stringValue)
            }
        }

        stringValueByBuffTypeIdByFieldId.set(
            fourCC(rawFieldId) as ObjectFieldId,
            stringValueByBuffTypeId,
        )
    }
    return stringValueByBuffTypeIdByFieldId
})

const buffByTypeIdByUnit = setmetatable(new LuaMap<Unit, LuaMap<number, Buff<any>>>(), {
    __mode: "k",
})

export type BuffConstructor<
    T extends Buff<any> = Buff<any>,
    Args extends any[] = any,
> = OmitConstructor<typeof Buff<any>> & (new (...args: Args) => T)

type NumberParameterValueType = number | AbilityNumberField | AbilityNumberLevelField

type IntegerParameterValueType = number | AbilityIntegerField | AbilityIntegerLevelField

type BooleanParameterValueType = boolean | AbilityBooleanField | AbilityBooleanLevelField

export class BuffUniqueGroup {}

export type BuffParameters<T extends Buff<any> = Buff> = Buff extends T
    ? {
          spellStealPriority?: number
          level?: number
          duration?: number
          learnLevelMinimum?: number
          source?: Unit

          behaviorConstructors?: (new (unit: Unit) => UnitBehavior)[]
          abilityTypeIds?: Record<
              AbilityTypeId,
              {
                  [
                      numberField: (AbilityNumberField | AbilityNumberLevelField) & symbol
                  ]: NumberParameterValueType
              } & {
                  /** Default `true`. */
                  readonly isButtonVisible?: boolean
                  /** Default is the level of the source ability or 0 if it is absent. */
                  readonly level?: number
              }
          >

          damageUponDeathAllowedTargetCombatClassifications?:
              | CombatClassifications
              | AbilityCombatClassificationsLevelField
          damageUponDeath?: NumberParameterValueType
          damageUponDeathRange?: NumberParameterValueType
          mediumDamageUponDeath?: NumberParameterValueType
          mediumDamageUponDeathRange?: NumberParameterValueType
          smallDamageUponDeath?: NumberParameterValueType
          smallDamageUponDeathRange?: NumberParameterValueType

          damageOverDuration?: NumberParameterValueType
          damagePerInterval?: NumberParameterValueType
          damageInterval?: NumberParameterValueType
          healingOverDuration?: NumberParameterValueType
          healingPerInterval?: NumberParameterValueType
          healingInterval?: NumberParameterValueType
          damageIncrease?: NumberParameterValueType
          damageIncreaseFactor?: NumberParameterValueType
          armorIncrease?: NumberParameterValueType
          armorIncreaseFactor?: NumberParameterValueType
          attackSpeedIncreaseFactor?: NumberParameterValueType
          movementSpeedIncreaseFactor?: NumberParameterValueType
          receivedDamageFactor?: NumberParameterValueType
          receivedMagicDamageFactor?: NumberParameterValueType
          durationIncreaseOnAutoAttack?: NumberParameterValueType
          maximumRemainingDuration?: NumberParameterValueType
          maximumDuration?: NumberParameterValueType
          stuns?: BooleanParameterValueType
          ignoresStunImmunity?: BooleanParameterValueType
          providesStunImmunity?: BooleanParameterValueType
          providesSpellImmunity?: BooleanParameterValueType
          providesInvulnerability?: BooleanParameterValueType
          disablesAutoAttack?: BooleanParameterValueType
          destroysOnDamage?: BooleanParameterValueType
          maximumAutoAttackCount?: IntegerParameterValueType

          damageOnExpiration?: NumberParameterValueType
          healingOnExpiration?: NumberParameterValueType
          killsOnExpiration?: BooleanParameterValueType
          explodesOnExpiration?: BooleanParameterValueType

          uniqueGroup?: BuffUniqueGroup
      }
    : BuffParameters & (T extends Buff<infer AdditionalParameters> ? AdditionalParameters : object)

const buffParametersKeys: Record<keyof BuffParameters, true> = {
    spellStealPriority: true,
    level: true,
    duration: true,
    learnLevelMinimum: true,
    source: true,
    behaviorConstructors: true,
    abilityTypeIds: true,
    damageUponDeathAllowedTargetCombatClassifications: true,
    damageUponDeath: true,
    damageUponDeathRange: true,
    mediumDamageUponDeath: true,
    mediumDamageUponDeathRange: true,
    smallDamageUponDeath: true,
    smallDamageUponDeathRange: true,
    damageOverDuration: true,
    damagePerInterval: true,
    damageInterval: true,
    healingOverDuration: true,
    healingPerInterval: true,
    healingInterval: true,
    damageIncrease: true,
    damageIncreaseFactor: true,
    armorIncrease: true,
    armorIncreaseFactor: true,
    attackSpeedIncreaseFactor: true,
    movementSpeedIncreaseFactor: true,
    receivedDamageFactor: true,
    receivedMagicDamageFactor: true,
    durationIncreaseOnAutoAttack: true,
    maximumDuration: true,
    maximumRemainingDuration: true,
    stuns: true,
    ignoresStunImmunity: true,
    providesStunImmunity: true,
    providesSpellImmunity: true,
    providesInvulnerability: true,
    disablesAutoAttack: true,
    destroysOnDamage: true,
    maximumAutoAttackCount: true,
    uniqueGroup: true,
    damageOnExpiration: true,
    healingOnExpiration: true,
    killsOnExpiration: true,
    explodesOnExpiration: true,
}

const resolveNumberValue = <T extends number | undefined>(
    ability: Ability | undefined,
    level: number | undefined,
    value: T | AbilityNumberField | AbilityNumberLevelField,
): T | number => {
    if (value == undefined || typeof value == "number") {
        return value
    }
    if (ability == undefined) {
        throw new IllegalArgumentException()
    }
    return value instanceof AbilityNumberField
        ? value.getValue(ability)
        : value.getValue(ability, level ?? ability.level)
}

const resolveBooleanValue = <T extends boolean | undefined>(
    ability: Ability | undefined,
    level: number | undefined,
    value: T | AbilityBooleanField | AbilityBooleanLevelField,
): T | boolean => {
    if (value == undefined || typeof value == "boolean") {
        return value
    }
    if (ability == undefined) {
        throw new IllegalArgumentException()
    }
    return value instanceof AbilityBooleanField
        ? value.getValue(ability)
        : value.getValue(ability, level ?? ability.level)
}

const resolveAndSetNumberValue = <T extends string>(
    buff: Record<T, number>,
    property: T,
    ability: Ability | undefined,
    level: number | undefined,
    value: number | AbilityNumberField | AbilityNumberLevelField | undefined,
    defaultValue: number | AbilityNumberField | AbilityNumberLevelField | undefined,
): void => {
    const resolvedValue = resolveNumberValue(ability, level, value ?? defaultValue)
    if (resolvedValue != null) {
        buff[property] = resolvedValue
    }
}

const buffBooleanParameters = [
    "stuns",
    "ignoresStunImmunity",
    "disablesAutoAttack",
    "providesInvulnerability",
    "killsOnExpiration",
    "explodesOnExpiration",
] as const

const buffNumberParameters = [
    "durationIncreaseOnAutoAttack",
    "attackSpeedIncreaseFactor",
    "movementSpeedIncreaseFactor",
    "armorIncrease",
    "receivedDamageFactor",
    "maximumAutoAttackCount",
    "damageInterval",
    "damagePerInterval",
    "damageOverDuration",
    "healingInterval",
    "healingPerInterval",
    "healingOverDuration",
    "damageOnExpiration",
    "healingOnExpiration",
] as const

const unsuccessfulApplicationMarker = {}

const enum BuffPropertyKey {
    UNIT = 100,
    SOURCE,

    DURATION,

    UNIQUE_GROUP,

    EFFECT_MODEL_PATH,
    SPECIAL_EFFECT_MODEL_PATH,

    DURATION_INCREASE_ON_AUTO_ATTACK,
    MAXIMUM_DURATION,
    MAXIMUM_REMAINING_DURATION,

    DAMAGE_OVER_DURATION,
    DAMAGE_PER_INTERVAL,
    DAMAGE_INTERVAL,

    REMAINING_DAMAGE_OVER_DURATION,
    DAMAGE_INTERVAL_TIMER,

    HEALING_OVER_DURATION,
    HEALING_PER_INTERVAL,
    HEALING_INTERVAL,

    REMAINING_HEALING_OVER_DURATION,
    HEALING_INTERVAL_TIMER,

    DAMAGE_ON_EXPIRATION,
    HEALING_ON_EXPIRATION,

    DAMAGE_UPON_DEATH_ALLOWED_TARGET_CLASSIFICATIONS,
    DAMAGE_UPON_DEATH,
    DAMAGE_UPON_DEATH_RANGE,
    MEDIUM_DAMAGE_UPON_DEATH,
    MEDIUM_DAMAGE_UPON_DEATH_RANGE,
    SMALL_DAMAGE_UPON_DEATH,
    SMALL_DAMAGE_UPON_DEATH_RANGE,

    AUTO_ATTACK_COUNT,
    MAXIMUM_AUTO_ATTACK_COUNT,

    STUNS,
    IGNORES_STUN_IMMUNITY,
    DISABLES_AUTO_ATTACK,
    PROVIDES_INVULNERABILITY,
    KILLS_ON_EXPIRATION,
    EXPLODES_ON_EXPIRATION,
}

export const enum BuffTypeIdSelectionPolicy {
    LEAST_DURATION,
}

const selectBuffTypeIdWithLeastDuration = (
    buffTypeIds: ApplicableBuffTypeId[],
    unit: Unit,
): ApplicableBuffTypeId => {
    let minimumDuration: number | undefined = undefined
    let minimumDurationBuffTypeId: ApplicableBuffTypeId | undefined
    let firstNativeBuffTypeId: ApplicableBuffTypeId | undefined = undefined
    for (const buffTypeId of buffTypeIds) {
        const buff = buffByTypeIdByUnit.get(unit)?.get(buffTypeId)
        if (buff != undefined) {
            if (minimumDuration == undefined || buff.remainingDuration < minimumDuration) {
                minimumDuration = buff.remainingDuration
                minimumDurationBuffTypeId = buffTypeId
            }
        } else if (unit.hasBuff(buffTypeId)) {
            firstNativeBuffTypeId = firstNativeBuffTypeId ?? buffTypeId
        } else {
            return buffTypeId
        }
    }
    if (minimumDurationBuffTypeId != undefined) {
        return minimumDurationBuffTypeId
    }
    return checkNotNull(firstNativeBuffTypeId)
}

/** @internal For use by internal systems only. */
export let checkBuff: (this: void, unit: Unit, buffTypeId: number) => void

/** @internal For use by internal systems only. */
export let checkBuffs: (this: void, unit: Unit) => void

const destroyBuffIfItHasSameUniqueGroup = (buff: Buff, uniqueGroup: BuffUniqueGroup) => {
    if (buff[BuffPropertyKey.UNIQUE_GROUP] == uniqueGroup) {
        buff.destroy()
    }
}

const destroyBuff = (buff: Buff) => {
    buff.destroy()
}

const expireBuff = (buff: Buff) => {
    const remainingDamageOverDuration = buff[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] ?? 0
    const remainingHealingOverDuration = buff[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] ?? 0
    if (remainingDamageOverDuration != 0 || remainingHealingOverDuration != 0) {
        buff.flashSpecialEffect()
        if (remainingDamageOverDuration != 0) {
            ;(buff[BuffPropertyKey.SOURCE] ?? buff[BuffPropertyKey.UNIT]).damageTarget(
                buff[BuffPropertyKey.UNIT],
                remainingDamageOverDuration,
            )
            buff[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] = undefined
        }
        if (remainingHealingOverDuration != 0) {
            ;(buff[BuffPropertyKey.SOURCE] ?? buff[BuffPropertyKey.UNIT]).healTarget(
                buff[BuffPropertyKey.UNIT],
                remainingHealingOverDuration,
            )
            buff[BuffPropertyKey.REMAINING_HEALING_OVER_DURATION] = undefined
        }
    }
    Timer.run(destroyBuff, buff)
    buff.onExpiration()
}

export type BuffAdditionalParameters = Prohibit<Record<string, any>, keyof BuffParameters>

export type BuffConstructorParameters<AdditionalParameters extends BuffAdditionalParameters> = [
    ...typeId:
        | [ApplicableBuffTypeId]
        | [
              typeIds: NonEmptyArray<ApplicableBuffTypeId>,
              typeIdSelectionPolicy: BuffTypeIdSelectionPolicy,
          ],
    polarity: BuffPolarity,
    resistanceType: BuffResistanceType,
    ...abilityOrParameters:
        | [
              ability: Ability,
              parameters?: BuffParameters & Omit<AdditionalParameters, keyof BuffParameters>,
          ]
        | [parameters?: BuffParameters & Omit<AdditionalParameters, keyof BuffParameters>],
]

const buffDamageIntervalInitialTimerCallback = (buff: Buff) => {
    buffDamageIntervalTimerCallback(buff)
    const timer = buff[BuffPropertyKey.DAMAGE_INTERVAL_TIMER]
    const damageInterval = buff[BuffPropertyKey.DAMAGE_INTERVAL]
    if (timer != undefined && damageInterval != undefined && damageInterval > 0) {
        timer.start(damageInterval, true, buffDamageIntervalTimerCallback, buff)
    }
}

const buffDamageIntervalTimerCallback = (buff: Buff) => {
    buff.flashSpecialEffect()
    const source = buff[BuffPropertyKey.SOURCE] ?? buff[BuffPropertyKey.UNIT]
    const remainingDamageOverDuration = buff[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] ?? 0
    if (remainingDamageOverDuration != 0) {
        const damageInterval = buff[BuffPropertyKey.DAMAGE_INTERVAL] ?? 0
        if (damageInterval != 0) {
            const damage =
                remainingDamageOverDuration / (1 + buff.remainingDuration / damageInterval)
            source.damageTarget(buff[BuffPropertyKey.UNIT], damage)
            buff[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] =
                remainingDamageOverDuration - damage
        }
    }
    const damagePerInterval = buff[BuffPropertyKey.DAMAGE_PER_INTERVAL] ?? 0
    if (remainingDamageOverDuration == 0 || damagePerInterval != 0) {
        source.damageTarget(buff[BuffPropertyKey.UNIT], damagePerInterval)
    }
}

const buffHealingIntervalInitialTimerCallback = (buff: Buff) => {
    buffHealingIntervalTimerCallback(buff)
    const timer = buff[BuffPropertyKey.HEALING_INTERVAL_TIMER]
    const healingInterval = buff[BuffPropertyKey.HEALING_INTERVAL]
    if (timer != undefined && healingInterval != undefined && healingInterval > 0) {
        timer.start(healingInterval, true, buffHealingIntervalTimerCallback, buff)
    }
}

const buffHealingIntervalTimerCallback = (buff: Buff) => {
    if (buff[BuffPropertyKey.HEALING_INTERVAL] != buff[BuffPropertyKey.DAMAGE_INTERVAL]) {
        buff.flashSpecialEffect()
    }
    const source = buff[BuffPropertyKey.SOURCE] ?? buff[BuffPropertyKey.UNIT]
    const remainingHealingOverDuration = buff[BuffPropertyKey.REMAINING_HEALING_OVER_DURATION] ?? 0
    if (remainingHealingOverDuration != 0) {
        const healingInterval = buff[BuffPropertyKey.HEALING_INTERVAL] ?? 0
        if (healingInterval != 0) {
            const healing =
                remainingHealingOverDuration / (1 + buff.remainingDuration / healingInterval)
            source.healTarget(buff[BuffPropertyKey.UNIT], healing)
            buff[BuffPropertyKey.REMAINING_HEALING_OVER_DURATION] =
                remainingHealingOverDuration - healing
        }
    }
    const healingPerInterval = buff[BuffPropertyKey.HEALING_PER_INTERVAL] ?? 0
    if (remainingHealingOverDuration == 0 || healingPerInterval != 0) {
        source.healTarget(buff[BuffPropertyKey.UNIT], healingPerInterval)
    }
}

export class Buff<
    AdditionalParameters extends Prohibit<Record<string, any>, keyof BuffParameters> = object,
> extends UnitBehavior {
    protected readonly __additionalParametersBrand?: AdditionalParameters

    private [BuffPropertyKey.UNIT]: Unit
    private [BuffPropertyKey.SOURCE]?: Unit

    private [BuffPropertyKey.DURATION]: number

    private [BuffPropertyKey.UNIQUE_GROUP]?: BuffUniqueGroup

    private [BuffPropertyKey.EFFECT_MODEL_PATH]: string
    private [BuffPropertyKey.SPECIAL_EFFECT_MODEL_PATH]: string

    private [BuffPropertyKey.DURATION_INCREASE_ON_AUTO_ATTACK]?: number
    private [BuffPropertyKey.MAXIMUM_DURATION]?: number
    private [BuffPropertyKey.MAXIMUM_REMAINING_DURATION]?: number

    private [BuffPropertyKey.DAMAGE_OVER_DURATION]?: number
    private [BuffPropertyKey.DAMAGE_PER_INTERVAL]?: number
    private [BuffPropertyKey.DAMAGE_INTERVAL]?: number

    private [BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION]?: number
    private [BuffPropertyKey.DAMAGE_INTERVAL_TIMER]?: Timer

    private [BuffPropertyKey.HEALING_OVER_DURATION]?: number
    private [BuffPropertyKey.HEALING_PER_INTERVAL]?: number
    private [BuffPropertyKey.HEALING_INTERVAL]?: number

    private [BuffPropertyKey.REMAINING_HEALING_OVER_DURATION]?: number
    private [BuffPropertyKey.HEALING_INTERVAL_TIMER]?: Timer

    private [BuffPropertyKey.DAMAGE_ON_EXPIRATION]?: number
    private [BuffPropertyKey.HEALING_ON_EXPIRATION]?: number

    private [BuffPropertyKey.DAMAGE_UPON_DEATH_ALLOWED_TARGET_CLASSIFICATIONS]?: CombatClassifications
    private [BuffPropertyKey.DAMAGE_UPON_DEATH]?: number
    private [BuffPropertyKey.DAMAGE_UPON_DEATH_RANGE]?: number
    private [BuffPropertyKey.MEDIUM_DAMAGE_UPON_DEATH]?: number
    private [BuffPropertyKey.MEDIUM_DAMAGE_UPON_DEATH_RANGE]?: number
    private [BuffPropertyKey.SMALL_DAMAGE_UPON_DEATH]?: number
    private [BuffPropertyKey.SMALL_DAMAGE_UPON_DEATH_RANGE]?: number

    private [BuffPropertyKey.MAXIMUM_AUTO_ATTACK_COUNT]?: number
    private [BuffPropertyKey.AUTO_ATTACK_COUNT]?: number

    private [BuffPropertyKey.STUNS]?: true
    private [BuffPropertyKey.IGNORES_STUN_IMMUNITY]?: true
    private [BuffPropertyKey.DISABLES_AUTO_ATTACK]?: true
    private [BuffPropertyKey.PROVIDES_INVULNERABILITY]?: true
    private [BuffPropertyKey.KILLS_ON_EXPIRATION]?: true
    private [BuffPropertyKey.EXPLODES_ON_EXPIRATION]?: true

    protected static readonly defaultParameters: BuffParameters = {}

    public get source(): Unit {
        return this[BuffPropertyKey.SOURCE] ?? this._unit
    }

    public readonly typeId: ApplicableBuffTypeId
    public readonly polarity: BuffPolarity
    public readonly resistanceType: BuffResistanceType

    public readonly parameters: IsExactlyAny<AdditionalParameters> extends true
        ? any
        : keyof AdditionalParameters extends never
          ? undefined
          : {
                [K in keyof Omit<
                    AdditionalParameters,
                    keyof BuffParameters
                >]: AdditionalParameters[K] extends AbilityDependentValue<infer T>
                    ? T
                    : AdditionalParameters[K]
            } = undefined!

    private readonly handle: jability

    private _timer?: Timer
    private readonly _level?: number
    private readonly _spellStealPriority?: number
    private readonly _learnLevelMinimum?: number
    private _bonusIdByBonusType?: LuaMap<UnitBonusType, UnitBonusId | undefined>
    private readonly _abilityTypeIds?: LuaSet<AbilityTypeId>
    private _behaviors?: UnitBehavior[]

    private getUnitBonus(bonusType: UnitBonusType): number {
        const bonusId = this._bonusIdByBonusType?.get(bonusType)
        return bonusId == undefined ? 0 : getUnitBonus(this._unit, bonusType, bonusId)
    }

    private addOrUpdateOrRemoveUnitBonus(bonusType: UnitBonusType, value: number): void {
        let bonusIdByBonusType = this._bonusIdByBonusType
        if (bonusIdByBonusType == undefined) {
            bonusIdByBonusType = new LuaMap()
            this._bonusIdByBonusType = bonusIdByBonusType
        }

        bonusIdByBonusType.set(
            bonusType,
            addOrUpdateOrRemoveUnitBonus(
                this._unit,
                bonusType,
                bonusIdByBonusType.get(bonusType),
                value,
            ),
        )
    }

    public constructor(target: Unit, ...parameters: BuffConstructorParameters<AdditionalParameters>)

    public constructor(
        private _unit: Unit,
        typeIdOrTypeIds: ApplicableBuffTypeId | NonEmptyArray<ApplicableBuffTypeId>,
        polarityOrTypeIdSelectionPolicy: BuffPolarity | BuffTypeIdSelectionPolicy,
        resistanceTypeOrPolarity: BuffResistanceType | BuffPolarity,
        abilityOrParametersOrResistanceType?:
            | Ability
            | (BuffParameters & Omit<AdditionalParameters, keyof BuffParameters>)
            | BuffResistanceType,
        parametersOrAbility?:
            | (BuffParameters & Omit<AdditionalParameters, keyof BuffParameters>)
            | Ability,
        parameters?: BuffParameters & Omit<AdditionalParameters, keyof BuffParameters>,
    ) {
        super(_unit)
        this[BuffPropertyKey.UNIT] = _unit

        let typeId: ApplicableBuffTypeId
        let polarity: BuffPolarity
        let resistanceType: BuffResistanceType
        let ability: Ability | undefined
        if (typeof typeIdOrTypeIds != "number") {
            typeId = selectBuffTypeIdWithLeastDuration(typeIdOrTypeIds, _unit)

            polarity = resistanceTypeOrPolarity as BuffPolarity
            resistanceType = abilityOrParametersOrResistanceType as BuffResistanceType
            if (parametersOrAbility instanceof Ability) {
                ability = parametersOrAbility
            } else {
                ability = undefined
                parameters = parametersOrAbility
            }
        } else {
            typeId = typeIdOrTypeIds
            polarity = polarityOrTypeIdSelectionPolicy as BuffPolarity
            resistanceType = resistanceTypeOrPolarity as BuffResistanceType
            if (abilityOrParametersOrResistanceType instanceof Ability) {
                ability = abilityOrParametersOrResistanceType
                parameters = parametersOrAbility as BuffParameters &
                    Omit<AdditionalParameters, keyof BuffParameters>
            } else {
                ability = undefined
                parameters = abilityOrParametersOrResistanceType as BuffParameters &
                    Omit<AdditionalParameters, keyof BuffParameters>
            }
        }
        this.typeId = typeId
        this.polarity = polarity
        this.resistanceType = resistanceType

        if (!(ability instanceof Ability)) {
            parameters = ability
            ability = undefined
        }

        const defaultParameters = (this.constructor as typeof Buff).defaultParameters

        let level = parameters?.level ?? defaultParameters.level
        let spellStealPriority =
            parameters?.spellStealPriority ?? defaultParameters.spellStealPriority
        let learnLevelMinimum = parameters?.learnLevelMinimum ?? defaultParameters.learnLevelMinimum
        let duration = parameters?.duration ?? defaultParameters.duration
        let source = parameters?.source ?? defaultParameters.source

        if (ability != undefined) {
            if (level == undefined && ability.getField(ABILITY_IF_LEVELS) > 1) {
                level = ability.level
            }
            if (source == undefined) {
                const abilityOwner = ability.owner
                if (abilityOwner instanceof Unit) {
                    source = abilityOwner
                } else {
                    source = abilityOwner.owner
                }
            }
            spellStealPriority = spellStealPriority ?? ability.getField(ABILITY_IF_PRIORITY)
            learnLevelMinimum = learnLevelMinimum ?? ability.getField(ABILITY_IF_REQUIRED_LEVEL)
            duration = duration ?? getAbilityDuration(ability, _unit)
        }

        let buffByTypeId = buffByTypeIdByUnit.get(_unit)
        if (buffByTypeId == undefined) {
            buffByTypeId = new LuaMap()
            buffByTypeIdByUnit.set(_unit, buffByTypeId)
        }

        buffByTypeId.get(typeId)?.destroy()

        const uniqueGroup = parameters?.uniqueGroup ?? defaultParameters?.uniqueGroup
        if (uniqueGroup != undefined) {
            Buff.forAll(_unit, destroyBuffIfItHasSameUniqueGroup, uniqueGroup)
        }

        if (
            !internalApplyBuff(
                _unit,
                typeId,
                polarity,
                resistanceType,
                level,
                duration,
                spellStealPriority,
                learnLevelMinimum,
            )
        ) {
            super.destroy()
            throw unsuccessfulApplicationMarker
        }

        const handle = BlzGetUnitAbility(_unit.handle, typeId)
        if (handle == undefined) {
            super.destroy()
            throw unsuccessfulApplicationMarker
        }
        this.handle = handle

        buffByTypeId.set(typeId, this)

        this._level = level
        this._spellStealPriority = spellStealPriority
        this._learnLevelMinimum = learnLevelMinimum
        this[BuffPropertyKey.SOURCE] = source
        this[BuffPropertyKey.DURATION] = duration ?? 0
        this[BuffPropertyKey.UNIQUE_GROUP] = uniqueGroup

        this[BuffPropertyKey.EFFECT_MODEL_PATH] = BlzGetAbilityStringLevelField(
            this.handle,
            ABILITY_SLF_EFFECT,
            0,
        )
        this[BuffPropertyKey.SPECIAL_EFFECT_MODEL_PATH] = BlzGetAbilityStringLevelField(
            this.handle,
            ABILITY_SLF_SPECIAL,
            0,
        )

        if (parameters != undefined || next(defaultParameters)[0] != undefined) {
            for (const buffBooleanParameter of buffBooleanParameters) {
                if (
                    resolveBooleanValue(
                        ability,
                        level,
                        parameters?.[buffBooleanParameter] ??
                            defaultParameters[buffBooleanParameter],
                    )
                ) {
                    this[buffBooleanParameter] = true
                }
            }

            for (const buffNumberParameter of buffNumberParameters) {
                resolveAndSetNumberValue(
                    this,
                    buffNumberParameter,
                    ability,
                    level,
                    parameters?.[buffNumberParameter],
                    defaultParameters[buffNumberParameter],
                )
            }

            const maximumDuration = parameters?.maximumDuration ?? defaultParameters.maximumDuration
            if (maximumDuration != undefined) {
                this[BuffPropertyKey.MAXIMUM_DURATION] = resolveNumberValue(
                    ability,
                    level,
                    maximumDuration,
                )
            }

            const maximumRemainingDuration =
                parameters?.maximumRemainingDuration ?? defaultParameters.maximumRemainingDuration
            if (maximumRemainingDuration != undefined) {
                this[BuffPropertyKey.MAXIMUM_REMAINING_DURATION] = resolveNumberValue(
                    ability,
                    level,
                    maximumRemainingDuration,
                )
            }

            const parametersAbilityTypeIds =
                parameters?.abilityTypeIds ?? defaultParameters.abilityTypeIds
            if (parametersAbilityTypeIds != undefined) {
                let abilityTypeIds = this._abilityTypeIds
                if (abilityTypeIds == undefined) {
                    abilityTypeIds = new LuaSet()
                    this._abilityTypeIds = abilityTypeIds
                }
                for (const [abilityTypeId, abilityParameters] of pairs(parametersAbilityTypeIds)) {
                    const addedAbility = _unit.addAbility(abilityTypeId)
                    if (addedAbility != undefined) {
                        _unit.makeAbilityPermanent(abilityTypeId, true)
                        _unit.setAbilityLevel(
                            abilityTypeId,
                            1 + (abilityParameters.level ?? ability?.level ?? 0),
                        )
                        for (const [abilityParameterKey, abilityParameterValue] of pairs(
                            abilityParameters,
                        )) {
                            if (abilityParameterKey == "isButtonVisible") {
                                if (
                                    !resolveBooleanValue(
                                        ability,
                                        level,
                                        abilityParameterValue as
                                            | boolean
                                            | AbilityBooleanField
                                            | AbilityBooleanLevelField,
                                    )
                                ) {
                                    _unit.hideAbility(abilityTypeId, true)
                                }
                            } else if (abilityParameterKey != "level") {
                                abilityParameterKey.setValue(
                                    addedAbility,
                                    resolveNumberValue<number>(
                                        ability,
                                        level,
                                        abilityParameterValue as
                                            | number
                                            | AbilityNumberField
                                            | AbilityNumberLevelField,
                                    ),
                                )
                            }
                        }
                        abilityTypeIds.add(abilityTypeId)
                    }
                }

                const behaviorConstructors =
                    parameters?.behaviorConstructors ?? defaultParameters.behaviorConstructors
                if (behaviorConstructors != undefined) {
                    const behaviors: UnitBehavior[] = []
                    for (const i of $range(1, behaviorConstructors.length)) {
                        behaviors[i - 1] = new behaviorConstructors[i - 1](_unit)
                    }
                    this._behaviors = behaviors
                }
            }

            // TODO: properly.
            const additionalParameters = {} as any
            for (const [key, value] of pairs(parameters)) {
                if (!buffParametersKeys[key as keyof BuffParameters]) {
                    if (ability) {
                        additionalParameters[key] = resolveCurrentAbilityDependentValue(
                            ability,
                            value as any,
                        )
                    } else {
                        additionalParameters[key] = value
                    }
                }
            }
            if (next(additionalParameters)[0] != undefined) {
                this.parameters = additionalParameters
            }
        }

        if (duration != undefined && duration > 0) {
            const timer = Timer.create()
            timer.start(duration, false, expireBuff, this)
            this._timer = timer
        }
    }

    public get level(): number {
        return this._level ?? 0
    }

    public get remainingDamageOverDuration(): number {
        return this[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] ?? 0
    }

    public set remainingDamageOverDuration(remainingDamageOverDuration: number) {
        const remainingDamageOverDurationDelta =
            remainingDamageOverDuration -
            (this[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] ?? 0)
        this[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] =
            remainingDamageOverDuration != 0 ? remainingDamageOverDuration : undefined
        const damageOverDuration =
            (this[BuffPropertyKey.DAMAGE_OVER_DURATION] ?? 0) + remainingDamageOverDurationDelta
        this[BuffPropertyKey.DAMAGE_OVER_DURATION] =
            damageOverDuration != 0 ? damageOverDuration : undefined
    }

    public get damageOverDuration(): number {
        return this[BuffPropertyKey.DAMAGE_OVER_DURATION] ?? 0
    }

    public set damageOverDuration(damageOverDuration: number) {
        const damageOverDurationDelta =
            damageOverDuration - (this[BuffPropertyKey.DAMAGE_OVER_DURATION] ?? 0)
        this[BuffPropertyKey.DAMAGE_OVER_DURATION] =
            damageOverDuration != 0 ? damageOverDuration : undefined
        const remainingDamageOverDuration =
            (this[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] ?? 0) + damageOverDurationDelta
        this[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] =
            remainingDamageOverDuration != 0 ? remainingDamageOverDuration : undefined
    }

    public get damagePerInterval(): number {
        return this[BuffPropertyKey.DAMAGE_PER_INTERVAL] ?? 0
    }

    public set damagePerInterval(damagePerInterval: number) {
        this[BuffPropertyKey.DAMAGE_PER_INTERVAL] =
            damagePerInterval != 0 ? damagePerInterval : undefined
    }

    public get damageInterval(): number {
        return this[BuffPropertyKey.DAMAGE_INTERVAL] ?? 0
    }

    public set damageInterval(damageInterval: number) {
        if (damageInterval <= 0) {
            this[BuffPropertyKey.DAMAGE_INTERVAL] = damageInterval != 0 ? damageInterval : undefined
            const timer = this[BuffPropertyKey.DAMAGE_INTERVAL_TIMER]
            if (timer != undefined) {
                timer.destroy()
                this[BuffPropertyKey.DAMAGE_INTERVAL_TIMER] = undefined
            }
            return
        }
        this[BuffPropertyKey.DAMAGE_INTERVAL] = damageInterval
        const elapsed = this._timer?.elapsed ?? 0
        let timer = this[BuffPropertyKey.DAMAGE_INTERVAL_TIMER]
        if (timer == undefined) {
            timer = Timer.create()
            this[BuffPropertyKey.DAMAGE_INTERVAL_TIMER] = timer
        }
        const initialDelay =
            damageInterval -
            (elapsed >= damageInterval ? math.fmod(elapsed, damageInterval) : elapsed)
        if (initialDelay == damageInterval) {
            timer.start(damageInterval, true, buffDamageIntervalTimerCallback, this)
        } else {
            timer.start(initialDelay, false, buffDamageIntervalInitialTimerCallback, this)
        }
    }

    public get remainingHealingOverDuration(): number {
        return this[BuffPropertyKey.REMAINING_HEALING_OVER_DURATION] ?? 0
    }

    public set remainingHealingOverDuration(remainingHealingOverDuration: number) {
        const remainingHealingOverDurationDelta =
            remainingHealingOverDuration -
            (this[BuffPropertyKey.REMAINING_HEALING_OVER_DURATION] ?? 0)
        this[BuffPropertyKey.REMAINING_DAMAGE_OVER_DURATION] =
            remainingHealingOverDuration != 0 ? remainingHealingOverDuration : undefined
        const healingOverDuration =
            (this[BuffPropertyKey.HEALING_OVER_DURATION] ?? 0) + remainingHealingOverDurationDelta
        this[BuffPropertyKey.HEALING_OVER_DURATION] =
            healingOverDuration != 0 ? healingOverDuration : undefined
    }

    public get healingOverDuration(): number {
        return this[BuffPropertyKey.HEALING_OVER_DURATION] ?? 0
    }

    public set healingOverDuration(healingOverDuration: number) {
        const healingOverDurationDelta =
            healingOverDuration - (this[BuffPropertyKey.HEALING_OVER_DURATION] ?? 0)
        this[BuffPropertyKey.HEALING_OVER_DURATION] =
            healingOverDuration != 0 ? healingOverDuration : undefined
        const remainingHealingOverDuration =
            (this[BuffPropertyKey.REMAINING_HEALING_OVER_DURATION] ?? 0) + healingOverDurationDelta
        this[BuffPropertyKey.REMAINING_HEALING_OVER_DURATION] =
            remainingHealingOverDuration != 0 ? remainingHealingOverDuration : undefined
    }

    public get healingPerInterval(): number {
        return this[BuffPropertyKey.HEALING_PER_INTERVAL] ?? 0
    }

    public set healingPerInterval(healingPerInterval: number) {
        this[BuffPropertyKey.HEALING_PER_INTERVAL] =
            healingPerInterval != 0 ? healingPerInterval : undefined
    }

    public get healingInterval(): number {
        return this[BuffPropertyKey.HEALING_INTERVAL] ?? 0
    }

    public set healingInterval(healingInterval: number) {
        if (healingInterval <= 0) {
            this[BuffPropertyKey.HEALING_INTERVAL] =
                healingInterval != 0 ? healingInterval : undefined
            const timer = this[BuffPropertyKey.HEALING_INTERVAL_TIMER]
            if (timer != undefined) {
                timer.destroy()
                this[BuffPropertyKey.HEALING_INTERVAL_TIMER] = undefined
            }
            return
        }
        this[BuffPropertyKey.HEALING_INTERVAL] = healingInterval
        const elapsed = this._timer?.elapsed ?? 0
        let timer = this[BuffPropertyKey.HEALING_INTERVAL_TIMER]
        if (timer == undefined) {
            timer = Timer.create()
            this[BuffPropertyKey.HEALING_INTERVAL_TIMER] = timer
        }
        const initialDelay =
            healingInterval -
            (elapsed >= healingInterval ? math.fmod(elapsed, healingInterval) : elapsed)
        if (initialDelay == healingInterval) {
            timer.start(healingInterval, true, buffHealingIntervalTimerCallback, this)
        } else {
            timer.start(initialDelay, false, buffHealingIntervalInitialTimerCallback, this)
        }
    }

    public get damageOnExpiration(): number {
        return this[BuffPropertyKey.DAMAGE_ON_EXPIRATION] ?? 0
    }

    public set damageOnExpiration(damageOnExpiration: number) {
        this[BuffPropertyKey.DAMAGE_ON_EXPIRATION] =
            damageOnExpiration != 0 ? damageOnExpiration : undefined
    }

    public get healingOnExpiration(): number {
        return this[BuffPropertyKey.HEALING_ON_EXPIRATION] ?? 0
    }

    public set healingOnExpiration(healingOnExpiration: number) {
        this[BuffPropertyKey.HEALING_ON_EXPIRATION] =
            healingOnExpiration != 0 ? healingOnExpiration : undefined
    }

    public get receivedDamageFactor(): number {
        return this.getUnitBonus(UnitBonusType.RECEIVED_DAMAGE_FACTOR)
    }

    public set receivedDamageFactor(receivedDamageFactor: number) {
        this.addOrUpdateOrRemoveUnitBonus(
            UnitBonusType.RECEIVED_DAMAGE_FACTOR,
            receivedDamageFactor,
        )
    }

    public get armorIncrease(): number {
        return this.getUnitBonus(UnitBonusType.ARMOR)
    }

    public set armorIncrease(armorIncrease: number) {
        this.addOrUpdateOrRemoveUnitBonus(UnitBonusType.ARMOR, armorIncrease)
    }

    public get stuns(): boolean {
        return this[BuffPropertyKey.STUNS] ?? false
    }

    public set stuns(stuns: boolean) {
        if (!stuns && this[BuffPropertyKey.STUNS]) {
            if (this[BuffPropertyKey.IGNORES_STUN_IMMUNITY]) {
                this.object.decrementStunCounter()
            }
            this.object.decrementStunCounter()
            this[BuffPropertyKey.STUNS] = undefined
        } else if (stuns && !this[BuffPropertyKey.STUNS]) {
            if (this[BuffPropertyKey.IGNORES_STUN_IMMUNITY]) {
                this.object.incrementStunCounter()
            }
            this.object.incrementStunCounter()
            this[BuffPropertyKey.STUNS] = true
        }
    }

    public get ignoresStunImmunity(): boolean {
        return this[BuffPropertyKey.IGNORES_STUN_IMMUNITY] ?? false
    }

    public set ignoresStunImmunity(ignoresStunImmunity: boolean) {
        if (!ignoresStunImmunity && this[BuffPropertyKey.IGNORES_STUN_IMMUNITY]) {
            if (this[BuffPropertyKey.STUNS]) {
                this.object.decrementStunCounter()
            }
            this[BuffPropertyKey.IGNORES_STUN_IMMUNITY] = undefined
        } else if (ignoresStunImmunity && !this[BuffPropertyKey.IGNORES_STUN_IMMUNITY]) {
            if (this[BuffPropertyKey.STUNS]) {
                this.object.incrementStunCounter()
            }
            this[BuffPropertyKey.IGNORES_STUN_IMMUNITY] = true
        }
    }

    public get disablesAutoAttack(): boolean {
        return this[BuffPropertyKey.DISABLES_AUTO_ATTACK] ?? false
    }

    public set disablesAutoAttack(disablesAutoAttack: boolean) {
        if (!disablesAutoAttack && this[BuffPropertyKey.DISABLES_AUTO_ATTACK]) {
            this.object.decrementDisableAutoAttackCounter()
            this[BuffPropertyKey.DISABLES_AUTO_ATTACK] = undefined
        } else if (disablesAutoAttack && !this[BuffPropertyKey.DISABLES_AUTO_ATTACK]) {
            this.object.incrementDisableAutoAttackCounter()
            this[BuffPropertyKey.DISABLES_AUTO_ATTACK] = true
        }
    }

    public get providesInvulnerability(): boolean {
        return this[BuffPropertyKey.PROVIDES_INVULNERABILITY] ?? false
    }

    public set providesInvulnerability(providesInvulnerability: boolean) {
        if (!providesInvulnerability && this[BuffPropertyKey.PROVIDES_INVULNERABILITY]) {
            this.object.decrementInvulnerabilityCounter()
            this[BuffPropertyKey.PROVIDES_INVULNERABILITY] = undefined
        } else if (providesInvulnerability && !this[BuffPropertyKey.PROVIDES_INVULNERABILITY]) {
            this.object.incrementInvulnerabilityCounter()
            this[BuffPropertyKey.PROVIDES_INVULNERABILITY] = true
        }
    }

    public get killsOnExpiration(): boolean {
        return this[BuffPropertyKey.KILLS_ON_EXPIRATION] ?? false
    }

    public set killsOnExpiration(killsOnExpiration: boolean) {
        if (!killsOnExpiration && this[BuffPropertyKey.KILLS_ON_EXPIRATION]) {
            this[BuffPropertyKey.KILLS_ON_EXPIRATION] = undefined
        } else if (killsOnExpiration && !this[BuffPropertyKey.KILLS_ON_EXPIRATION]) {
            this[BuffPropertyKey.KILLS_ON_EXPIRATION] = true
        }
    }

    public get explodesOnExpiration(): boolean {
        return this[BuffPropertyKey.EXPLODES_ON_EXPIRATION] ?? false
    }

    public set explodesOnExpiration(killsOnExpiration: boolean) {
        if (!killsOnExpiration && this[BuffPropertyKey.EXPLODES_ON_EXPIRATION]) {
            this[BuffPropertyKey.EXPLODES_ON_EXPIRATION] = undefined
        } else if (killsOnExpiration && !this[BuffPropertyKey.EXPLODES_ON_EXPIRATION]) {
            this[BuffPropertyKey.EXPLODES_ON_EXPIRATION] = true
        }
    }

    public get maximumAutoAttackCount(): number {
        return this[BuffPropertyKey.MAXIMUM_AUTO_ATTACK_COUNT] ?? 0
    }

    public set maximumAutoAttackCount(maximumAutoAttackCount: number) {
        if (maximumAutoAttackCount == 0) {
            this[BuffPropertyKey.MAXIMUM_AUTO_ATTACK_COUNT] = undefined
        } else {
            this[BuffPropertyKey.MAXIMUM_AUTO_ATTACK_COUNT] = maximumAutoAttackCount
        }
    }

    public get durationIncreaseOnAutoAttack(): number {
        return this[BuffPropertyKey.DURATION_INCREASE_ON_AUTO_ATTACK] ?? 0
    }

    public set durationIncreaseOnAutoAttack(durationIncreaseOnAutoAttack: number) {
        this[BuffPropertyKey.DURATION_INCREASE_ON_AUTO_ATTACK] = durationIncreaseOnAutoAttack
    }

    public get attackSpeedIncreaseFactor(): number {
        return this.getUnitBonus(UnitBonusType.ATTACK_SPEED_FACTOR)
    }

    public set attackSpeedIncreaseFactor(attackSpeedIncreaseFactor: number) {
        this.addOrUpdateOrRemoveUnitBonus(
            UnitBonusType.ATTACK_SPEED_FACTOR,
            attackSpeedIncreaseFactor,
        )
    }

    public get movementSpeedIncreaseFactor(): number {
        return this.getUnitBonus(UnitBonusType.MOVEMENT_SPEED_FACTOR)
    }

    public set movementSpeedIncreaseFactor(movementSpeedIncreaseFactor: number) {
        this.addOrUpdateOrRemoveUnitBonus(
            UnitBonusType.MOVEMENT_SPEED_FACTOR,
            movementSpeedIncreaseFactor,
        )
    }

    public get duration(): number {
        return this[BuffPropertyKey.DURATION]
    }

    public get remainingDuration(): number {
        return this._timer?.remaining ?? 0
    }

    public set remainingDuration(remainingDuration: number) {
        const remainingDurationDelta = remainingDuration - (this._timer?.remaining ?? 0)
        if (remainingDurationDelta != 0) {
            this[BuffPropertyKey.DURATION] += remainingDurationDelta
            if (remainingDuration <= 0) {
                Timer.run(destroyBuff, this)
            } else {
                if (
                    internalApplyBuff(
                        this._unit,
                        this.typeId,
                        this.polarity,
                        this.resistanceType,
                        this._level,
                        remainingDuration,
                        this._spellStealPriority,
                        this._learnLevelMinimum,
                    )
                ) {
                    let timer = this._timer
                    if (timer == undefined) {
                        timer = Timer.create()
                        this._timer = timer
                    }
                    timer.start(remainingDuration, false, expireBuff, this)
                }
            }
        }
    }

    public flashEffect(...parameters: [...widget: [] | [Widget], ...duration: [] | [number]]): void

    public flashEffect(widgetOrDuration?: Widget | number, duration?: number): void {
        const isWidgetProvided = typeof widgetOrDuration == "object"
        Effect.flash(
            this[BuffPropertyKey.EFFECT_MODEL_PATH],
            isWidgetProvided ? widgetOrDuration : this._unit,
            stringValueByBuffTypeIdByFieldId
                .get(fourCC("feft") as ObjectFieldId)!
                .get(this.typeId) ?? "origin",
            isWidgetProvided ? duration : widgetOrDuration,
        )
    }

    public flashSpecialEffect(
        ...parameters: [...widget: [] | [Widget], ...duration: [] | [number]]
    ): void

    public flashSpecialEffect(widgetOrDuration?: Widget | number, duration?: number): void {
        const isWidgetProvided = typeof widgetOrDuration == "object"
        Effect.flash(
            this[BuffPropertyKey.SPECIAL_EFFECT_MODEL_PATH],
            isWidgetProvided ? widgetOrDuration : this._unit,
            stringValueByBuffTypeIdByFieldId
                .get(fourCC("fspt") as ObjectFieldId)!
                .get(this.typeId) ?? "origin",
            isWidgetProvided ? duration : widgetOrDuration,
        )
    }

    protected override onDestroy(): Destructor {
        const unit = this._unit

        if (getUnitAbility(unit.handle, this.typeId) == this.handle) {
            removeBuff(unit.handle, this.typeId)
        }

        buffByTypeIdByUnit.get(unit)!.delete(this.typeId)

        const healingIntervalTimer = this[BuffPropertyKey.HEALING_INTERVAL_TIMER]
        if (healingIntervalTimer != undefined) {
            healingIntervalTimer.destroy()
            this[BuffPropertyKey.HEALING_INTERVAL_TIMER] = undefined
        }

        const damageIntervalTimer = this[BuffPropertyKey.DAMAGE_INTERVAL_TIMER]
        if (damageIntervalTimer != undefined) {
            damageIntervalTimer.destroy()
            this[BuffPropertyKey.DAMAGE_INTERVAL_TIMER] = undefined
        }

        if (this._timer != undefined) {
            this._timer.destroy()
        }

        if (this._behaviors != undefined) {
            for (const behavior of this._behaviors) {
                behavior.destroy()
            }
        }

        if (this[BuffPropertyKey.DISABLES_AUTO_ATTACK]) {
            unit.decrementDisableAutoAttackCounter()
        }

        if (this[BuffPropertyKey.STUNS]) {
            if (this[BuffPropertyKey.IGNORES_STUN_IMMUNITY]) {
                unit.decrementStunCounter()
            }
            unit.decrementStunCounter()
        }
        if (this._abilityTypeIds != undefined) {
            for (const abilityTypeId of this._abilityTypeIds) {
                unit.removeAbility(abilityTypeId)
            }
        }
        if (this._bonusIdByBonusType != undefined) {
            for (const [bonusType, bonusId] of this._bonusIdByBonusType) {
                removeUnitBonus(unit, bonusType, bonusId!)
            }
        }

        return super.onDestroy()
    }

    public static apply<T extends Buff<any>, Args extends any[]>(
        this: BuffConstructor<T, Args>,
        ...args: Args
    ): T | undefined {
        try {
            return new this(...args)
        } catch (exception) {
            if (exception == unsuccessfulApplicationMarker) {
                return undefined
            } else {
                throw exception
            }
        }
    }

    public static getByTypeId<T extends Buff<any>, Args extends any[]>(
        this: BuffConstructor<T, Args>,
        unit: Unit,
        typeId: ApplicableBuffTypeId,
    ): T | undefined {
        const buff = buffByTypeIdByUnit.get(unit)?.get(typeId)
        if (buff instanceof this) {
            return buff as T
        }
        return undefined
    }

    public onExpiration(): void {
        const unit = this.unit
        if (this[BuffPropertyKey.DAMAGE_ON_EXPIRATION] != undefined) {
            ;(this[BuffPropertyKey.SOURCE] ?? unit).damageTarget(
                unit,
                this[BuffPropertyKey.DAMAGE_ON_EXPIRATION] ?? 0,
            )
        }
        if (this[BuffPropertyKey.HEALING_ON_EXPIRATION] != undefined) {
            ;(this[BuffPropertyKey.SOURCE] ?? unit).healTarget(
                unit,
                this[BuffPropertyKey.DAMAGE_ON_EXPIRATION] ?? 0,
            )
        }
        if (this[BuffPropertyKey.EXPLODES_ON_EXPIRATION]) {
            unit.explode()
        } else if (this[BuffPropertyKey.KILLS_ON_EXPIRATION]) {
            unit.kill()
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public override onDeath(source: Unit | undefined) {
        const unit = this.unit
        if (this[BuffPropertyKey.DAMAGE_UPON_DEATH_ALLOWED_TARGET_CLASSIFICATIONS] != undefined) {
            damageArea(
                this[BuffPropertyKey.SOURCE] ?? unit,
                this[BuffPropertyKey.DAMAGE_UPON_DEATH_ALLOWED_TARGET_CLASSIFICATIONS]!,
                unit.x,
                unit.y,
                this[BuffPropertyKey.DAMAGE_UPON_DEATH_RANGE] ?? 0,
                this[BuffPropertyKey.DAMAGE_UPON_DEATH] ?? 0,
                this[BuffPropertyKey.MEDIUM_DAMAGE_UPON_DEATH_RANGE] ?? 0,
                this[BuffPropertyKey.MEDIUM_DAMAGE_UPON_DEATH] ?? 0,
                this[BuffPropertyKey.SMALL_DAMAGE_UPON_DEATH_RANGE] ?? 0,
                this[BuffPropertyKey.SMALL_DAMAGE_UPON_DEATH] ?? 0,
            )
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public override onDamageDealt(target: Unit, event: DamageEvent): void {
        if (event.isAttack) {
            if (this[BuffPropertyKey.DURATION_INCREASE_ON_AUTO_ATTACK] != undefined) {
                let durationIncrease = this[BuffPropertyKey.DURATION_INCREASE_ON_AUTO_ATTACK]
                const maximumDuration = this[BuffPropertyKey.MAXIMUM_DURATION] ?? 0
                if (maximumDuration > 0) {
                    durationIncrease = min(
                        durationIncrease,
                        max(0, maximumDuration - this[BuffPropertyKey.DURATION]),
                    )
                }
                let remainingDuration = this.remainingDuration + durationIncrease
                const maximumRemainingDuration =
                    this[BuffPropertyKey.MAXIMUM_REMAINING_DURATION] ?? 0
                if (maximumRemainingDuration > 0) {
                    remainingDuration = min(remainingDuration, maximumRemainingDuration)
                }
                this.remainingDuration = remainingDuration
            }

            const autoAttackCount = (this[BuffPropertyKey.AUTO_ATTACK_COUNT] ?? 0) + 1
            this[BuffPropertyKey.AUTO_ATTACK_COUNT] = autoAttackCount
            if (autoAttackCount == this[BuffPropertyKey.MAXIMUM_AUTO_ATTACK_COUNT]) {
                this.destroy()
            }
        }
    }

    static {
        const destroyBuffIfNeeded = (buff: Buff) => {
            if (getUnitAbility(buff[BuffPropertyKey.UNIT].handle, buff.typeId) != buff.handle) {
                buff.destroy()
            }
        }

        checkBuff = (unit: Unit, buffTypeId: number): void => {
            const buffByTypeId = buffByTypeIdByUnit.get(unit)
            if (buffByTypeId != undefined) {
                const buff = buffByTypeId.get(buffTypeId)
                if (buff != undefined) {
                    destroyBuffIfNeeded(buff)
                }
            }
        }

        checkBuffs = (unit: Unit): void => {
            Buff.forAll(unit, destroyBuffIfNeeded)
        }

        Unit.abilityChannelingStartEvent.addListener(
            EventListenerPriority.LOWEST,
            (caster: Unit) => {
                checkBuffs(caster)
                Timer.run(checkBuffs, caster)
            },
        )
        Unit.abilityUnitTargetChannelingStartEvent.addListener(
            EventListenerPriority.LOWEST,
            (caster, ability, target) => {
                checkBuffs(target)
                Timer.run(checkBuffs, target)
            },
        )
        Unit.abilityPointTargetChannelingStartEvent.addListener(
            EventListenerPriority.LOWEST,
            (caster, ability, x, y) => {
                const units = Unit.getInCollisionRange(
                    x,
                    y,
                    ability.getField(ABILITY_RLF_AREA_OF_EFFECT),
                )
                forEach(units, checkBuffs)
                Timer.run(forEach, units, checkBuffs)
            },
        )

        Unit.onDamage.addListener(EventListenerPriority.LOWEST, (source, target) => {
            if (source != undefined) {
                checkBuffs(source)
            }
            checkBuffs(target)
        })
    }
}
