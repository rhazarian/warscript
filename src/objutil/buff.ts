import { ObjectDefinition } from "./object"
import {
    AbilityDefinition,
    AbilityDefinitionCripple,
    AbilityDefinitionHealingSalve,
    AbilityDefinitionInnerFire,
    AbilityDefinitionSearingArrows,
    AbilityDefinitionSlowPoison,
} from "./ability"
import { DamageType, Unit } from "../core/types/unit"
import { InstantDummyCaster } from "../core/dummy"

import * as idgen from "./idgen"
import { Timer } from "../core/types/timer"
import { IllegalStateException } from "../exception"
import { AbilityTypeId } from "../engine/object-data/entry/ability-type"
import { AttackType } from "../engine/object-data/auxiliary/attack-type"

const assert = _G.assert
const pairs = _G.pairs

type Art = {
    model: string
    attachmentPoint: string
}

type ArtInput = string | Art

export class BuffDefinition extends ObjectDefinition {
    public readonly id: string

    public constructor(object: WarObject) {
        super(object)
        this.id = this.object.id
    }

    public set name(v: string) {
        this.setStringField("fnam", v)
    }

    public get name(): string {
        return this.getStringField("fnam")
    }

    public set tooltip(v: string) {
        this.setStringField("ftip", v)
    }

    public get tooltip(): string {
        return this.getStringField("ftip")
    }

    public set tooltipExtended(v: string) {
        this.setStringField("fube", v)
    }

    public get tooltipExtended(): string {
        return this.getStringField("fube")
    }

    public set icon(v: string) {
        this.setStringField("fart", v)
    }

    public get icon(): string {
        return this.getStringField("fart")
    }

    public set effectArt(v: string) {
        this.setStringField("feat", v)
    }

    public get effectArt(): string {
        return this.getStringField("feat")
    }

    public set specialArt(v: ArtInput) {
        if (typeof v == "string") {
            this.setStringField("fsat", v)
            this.setStringField("fspt", "")
        } else {
            this.setStringField("fsat", v.model)
            this.setStringField("fspt", v.attachmentPoint)
        }
    }

    public get specialArt(): Art {
        return {
            model: this.getStringField("fsat"),
            attachmentPoint: this.getStringField("fspt"),
        }
    }

    public set targetArt(
        v:
            | ArtInput
            | [
                  ...(
                      | [
                            ArtInput,
                            ...(
                                | [
                                      ArtInput,
                                      ...(
                                          | [
                                                ArtInput,
                                                ...(
                                                    | [
                                                          ArtInput,
                                                          ...(
                                                              | [ArtInput, ...([ArtInput] | [])]
                                                              | []
                                                          ),
                                                      ]
                                                    | []
                                                ),
                                            ]
                                          | []
                                      ),
                                  ]
                                | []
                            ),
                        ]
                      | []
                  ),
              ],
    ) {
        if (Array.isArray(v)) {
            this.setStringField(
                "ftat",
                v.map((art) => (typeof art == "string" ? art : art.model)).join(","),
            )
            let attachmentPoints = v.map((art) =>
                typeof art == "string" ? "origin" : art.attachmentPoint,
            )
            if (
                attachmentPoints.filter(
                    (attachmentPoint) => attachmentPoint == "origin" || attachmentPoint == "",
                ).length == attachmentPoints.length
            ) {
                attachmentPoints = []
            }
            for (const i of $range(0, 5)) {
                this.setStringField(`fta${i}`, attachmentPoints[i] ?? "")
            }
            this.setNumberField("ftac", attachmentPoints.length == 1 ? 0 : attachmentPoints.length)
        } else {
            this.setStringField("ftat", typeof v == "string" ? v : v.model)
            this.setStringField("fta0", typeof v == "string" ? "" : v.attachmentPoint)
            for (const i of $range(1, 5)) {
                this.setStringField(`fta${i}`, "")
            }
            this.setNumberField("ftac", 0)
        }
    }

    public get targetArt(): [
        ...(
            | [
                  Art,
                  ...(
                      | [Art, ...([Art, ...([Art, ...([Art, ...([Art] | [])] | [])] | [])] | [])]
                      | []
                  ),
              ]
            | []
        ),
    ] {
        const models = this.getStringField("ftat").split(",")
        const arts: Art[] = []
        for (const i of $range(1, models.length)) {
            const attachmentPoint = this.getStringField(`fta${i - 1}`) ?? ""
            arts[i - 1] = {
                model: models[i - 1],
                attachmentPoint: attachmentPoint == "" ? "origin" : attachmentPoint,
            }
        }
        return arts as any
    }

    public set missileArt(v: string) {
        this.setStringField("fmat", v)
    }

    public get missileArt(): string {
        return this.getStringField("fmat")
    }

    public set missileArc(v: number) {
        this.setNumberField("fmac", v)
    }

    public get missileArc(): number {
        return this.getNumberField("fmac")
    }

    public set missileSpeed(v: number) {
        this.setNumberField("fmsp", v)
    }

    public get missileSpeed(): number {
        return this.getNumberField("fmsp")
    }

    public set missileHoming(v: boolean) {
        this.setBooleanField("fmho", v)
    }

    public get missileHoming(): boolean {
        return this.getBooleanField("fmho")
    }

    public set sound(v: string) {
        this.setStringField("fefs", v)
    }

    public get sound(): string {
        return this.getStringField("fefs")
    }

    public set soundLooping(v: string) {
        this.setStringField("fefl", v)
    }

    public get soundLooping(): string {
        return this.getStringField("fefl")
    }

    public static create<T extends BuffDefinition>(
        this: new (object: WarObject) => T,
        baseId: string | number,
        id?: string | number,
    ): T {
        return new this(
            currentMap!.objects.buff.newObject(
                id ? util.id2s(id) : idgen.buff(),
                util.id2s(baseId),
            ),
        )
    }

    public static of<T extends BuffDefinition>(
        this: new (object: WarObject) => T,
        id: string | number,
    ): T {
        return new this(currentMap!.objects.buff.getObject(util.id2s(id)))
    }

    protected static createDerived<T extends BuffDefinition>(
        this: void,
        derived: new (object: WarObject) => T,
        baseId: string | number,
        id?: string | number,
    ): T {
        return BuffDefinition.create.call<
            { new (object: WarObject): T },
            [string | number, string | number | undefined],
            T
        >(derived, baseId, id)
    }
}

/*
macro_define("Buff", (preset: BuffPreset) => {
    return `(function()
        local unitRemoveAbility = UnitRemoveAbility

        local instances = {}

        local class = __TS__Class()
        function class.prototype.____constructor(self, unit, level)
            self.level = level
            instances[unit] = self
        end
        function class.prototype.destroy(self)
            unitRemoveAbility(self.target.handle, ${fourCC(preset.id)})
        end
        function class.create(unit, level)
            local instance = instances[unit]
            if instance then
                instance.destroy()
            end
            __TS__New(class, unit, level)
        end
        return class
    end)()`
})
*/

export type BuffPresetData = {
    readonly buffId: number
    readonly abilityId: number
    readonly positive: boolean
    readonly magic: boolean
}

const EVASION_ABILITY_IDS = postcompile(() => {
    const evasionParentAbilityIds = new Set([
        "AEev",
        "ACes",
        "ACev",
        "AIes",
        "ANdb",
        "Acdb",
        "AOcr",
        "ACct",
        "AIcs",
    ])
    const evasionAbilityIds = new Set<string>()
    if (currentMap) {
        for (const [, ability] of pairs(currentMap.objects.ability.all)) {
            if (evasionParentAbilityIds.has(ability.parentId ?? ability.id)) {
                evasionAbilityIds.add(ability.id)
            }
        }
    }
    return Array.from(evasionAbilityIds).map((id) => fourCC(id))
})

const SEARING_ARROWS_ABILITY_ID = compiletime(() => {
    const ability = new AbilityDefinitionSearingArrows()
    ability.name = "[Buff System] Searing Arrows"
    ability.levels = 1
    ability.damageBonus = 0
    ability.manaCost = 0
    ability.missileArt = ""
    ability.casterArt = ""
    ability.targetArt = ""
    ability.castRange = 99999
    ability.requiredLevel = 6
    ability.targetsAllowed = ["ground", "air", "structure", "ward", "vulnerable", "invulnerable"]
    return fourCC(ability.id)
})

export class BuffPreset extends BuffDefinition implements Compiletime<BuffPresetData> {
    private _positive = true
    private _magic = true
    private _visible = false

    public levels = 1

    public constructor(object: WarObject) {
        super(object)
    }

    private createInnerFireAbility(): AbilityDefinition {
        const ability = new AbilityDefinitionInnerFire()
        ability.levels = this.levels
        ability.damageIncrease = 0
        ability.armorBonus = 0
        ability.healthRegenerationBonus = 0
        ability.autoCastRange = 0
        ability.buffs = [this.id]
        return ability
    }

    private createCrippleAbility(): AbilityDefinition {
        const ability = new AbilityDefinitionCripple()
        ability.levels = this.levels
        ability.movementSpeedReduction = 0
        ability.attackSpeedReduction = 0
        ability.damageReduction = 0
        ability.buffs = [this.id]
        return ability
    }

    private createHealingSaveAbility(): AbilityDefinition {
        const ability = new AbilityDefinitionHealingSalve()
        ability.levels = this.levels
        ability.lifeRegenerated = 0.00000000000000000000000000000000000001175494
        ability.manaRegenerated = 0
        ability.allowWhenFull = "always"
        ability.noTargetRequired = false
        ability.dispelOnAttack = false
        ability.buffs = [this.id, this.id, this.id]
        return ability
    }

    private createSlowPoisonAbility(): AbilityDefinition {
        const ability = new AbilityDefinitionSlowPoison()
        ability.levels = this.levels
        ability.damagePerSecond = 0
        ability.movementSpeedFactor = 0
        ability.attackSpeedFactor = 0
        ability.stackingType = 0
        ability.buffs = [this.id, this.id]
        return ability
    }

    public compiletime(): BuffPresetData {
        const ability = this.positive
            ? this.magic
                ? this.createInnerFireAbility()
                : this.createHealingSaveAbility()
            : this.magic
              ? this.createCrippleAbility()
              : this.createSlowPoisonAbility()
        ability.manaCost = 0
        ability.cooldown = 0
        ability.durationNormal = 0
        ability.durationHero = 0
        ability.missileArt = ""
        ability.casterArt = ""
        ability.targetArt = ""
        ability.castRange = 99999
        ability.areaOfEffect = 0
        ability.checkDependencies = false
        ability.requirements = []
        ability.requiredLevel = 6
        ability.targetsAllowed = [
            "ground",
            "air",
            "structure",
            "ward",
            "vulnerable",
            "invulnerable",
        ]
        return {
            buffId: util.s2id(this.id),
            abilityId: util.s2id(ability.id),
            positive: this.positive,
            magic: this._magic,
        }
    }

    public set positive(v: boolean) {
        this._positive = v
    }

    public get positive(): boolean {
        return this._positive
    }

    public set magic(v: boolean) {
        this._magic = v
    }

    public get magic(): boolean {
        return this._magic
    }

    public set visible(v: boolean) {
        this._visible = v
    }

    public get visible(): boolean {
        return this._visible
    }

    public static create<T extends BuffDefinition>(
        this: new (object: WarObject) => T,
        baseId?: string | number,
        id?: string | number,
    ): T {
        return BuffDefinition.createDerived(this, baseId ?? "BHbz", id)
    }
}

type NonConstructorKeys<T> = { [P in keyof T]: T[P] extends new () => any ? never : P }[keyof T]
type OmitConstructor<T> = Pick<T, NonConstructorKeys<T>>

type BuffClass<T extends Buff, Args extends any[] = any[]> = OmitConstructor<typeof Buff> &
    (new (...args: Args) => T)

const buffs = setmetatable(new LuaTable<Unit, LuaMap<typeof Buff, Buff>>(), {
    __mode: "k",
    __index(unit: Unit) {
        const table = new LuaMap<typeof Buff, Buff>()
        this.set(unit, table)
        return table
    },
})

const IllegalBuffTargetException = {}

Unit.abilityCastingStartEvent[SEARING_ARROWS_ABILITY_ID].addListener((unit) => {
    unit.removeAbility(SEARING_ARROWS_ABILITY_ID)
})

export abstract class Buff implements Destroyable {
    private readonly handle?: jability
    private destroyed?: boolean
    private timer?: Timer

    public constructor(
        public readonly unit: Unit,
        public readonly source = unit,
        public readonly duration = 0,
        public readonly level = 0,
        private readonly preset?: BuffPresetData,
    ) {
        if (!unit.isAlive) {
            throw IllegalBuffTargetException
        }
        const constructor = this.constructor as typeof Buff
        const instances = buffs.get(unit)
        const instance = instances.get(constructor)
        if (instance) {
            instance.destroy()
            if (!instance.destroyed) {
                throw new IllegalStateException(
                    `Cannot destroy previous ${this.constructor.name} buff instance on ${unit}`,
                )
            }
        }
        instances.set(constructor, this)
        if (preset) {
            const unitHandle = unit.handle
            const slowPoisonMethod = !preset.positive && !preset.magic
            if (slowPoisonMethod) {
                for (const abilityId of EVASION_ABILITY_IDS) {
                    BlzUnitDisableAbility(unitHandle, abilityId, true, false)
                }
            }
            const success = InstantDummyCaster.getInstance().castTarget(
                unit.owner,
                [preset.abilityId, SEARING_ARROWS_ABILITY_ID],
                (ability) => {
                    ability.level = level
                    const actualDuration = duration > 0 ? duration : 2147483647
                    ability.setField(ABILITY_RLF_DURATION_NORMAL, level, actualDuration)
                    ability.setField(ABILITY_RLF_DURATION_HERO, level, actualDuration)
                },
                preset.positive
                    ? preset.magic
                        ? orderId("innerfire")
                        : 852609
                    : preset.magic
                      ? orderId("cripple")
                      : orderId("flamingarrowstarg"),
                unit,
            )
            if (slowPoisonMethod) {
                for (const abilityId of EVASION_ABILITY_IDS) {
                    BlzUnitDisableAbility(unitHandle, abilityId, false, false)
                }
            }
            const handle = BlzGetUnitAbility(unitHandle, preset.buffId)
            if (!success || handle == undefined) {
                throw new IllegalStateException(
                    `Cannot apply ${this.constructor.name} buff status effect on ${unit}`,
                )
            }
            this.handle = handle
        }
        if (duration > 0) {
            this.timer = Timer.simple(duration, () => {
                this.timer = undefined
                if (!this.destroyed) {
                    Timer.run(() => {
                        if (!this.destroyed) {
                            this.destroy()
                        }
                    })
                    this.onExpire()
                }
            })
        }
    }

    public static apply<T extends Buff, Args extends any[]>(
        this: BuffClass<T, Args>,
        ...args: Args
    ): T | undefined {
        try {
            return new this(...args)
        } catch (e) {
            if (e != IllegalBuffTargetException) {
                throw e
            }
            return undefined
        }
    }

    public static getInstance<T extends Buff>(this: BuffClass<T>, unit: Unit): T | undefined {
        return buffs.get(unit).get(this) as T | undefined
    }

    public static isApplied<T extends Buff>(this: BuffClass<T>, unit: Unit): boolean {
        return buffs.get(unit).get(this) != undefined
    }

    public static ifApplied<T extends Buff>(
        this: BuffClass<T>,
        unit: Unit,
        action: (buff: T) => void,
    ): void {
        const instance = buffs.get(unit).get(this)
        if (instance) {
            assert(instance instanceof this)
            action(instance as T)
        }
    }

    public destroy(): void {
        if (this.destroyed) {
            throw new IllegalStateException(
                `${this.constructor.name} buff on ${this.unit} is already destroyed`,
            )
        }
        if (this.timer) {
            this.timer.destroy()
            this.timer = undefined
        }
        if (this.preset) {
            this.unit.removeAbility(this.preset.buffId)
        }
        buffs.get(this.unit).delete(this.constructor as typeof Buff)
        this.destroyed = true
    }

    protected onDispel(source: Unit | undefined): void {
        // no-op
    }

    protected onExpire(): void {
        // no-op
    }
}

Unit.deathEvent.addListener((unit) => {
    for (const [, buff] of buffs.get(unit)) {
        buff.destroy()
    }
})

Unit.destroyEvent.addListener((unit) => {
    for (const [, buff] of buffs.get(unit)) {
        buff.destroy()
    }
})

const unitRemoveBuffs = UnitRemoveBuffs
_G.UnitRemoveBuffs = (unit, removePositive, removeNegative) => {
    unitRemoveBuffs(unit, removePositive, removeNegative)
    for (const [, buff] of buffs.get(Unit.of(unit))) {
        const preset = buff["preset"]
        if (preset) {
            const positive = preset.positive
            if ((positive && removePositive) || (!positive && removeNegative)) {
                buff.destroy()
            }
        }
    }
}

const selfDispelAbilityIds = compiletime(
    [
        "AHav",
        "ANav",
        "AOww",
        "AHds",
        "ACds",
        "AIdv",
        "AOmi",
        "AIvu",
        "AIvg",
        "AIvl",
        "ANef",
        "Acef",
        "AIxs",
        "Amdf",
        "AEtq",
    ].map((id) => fourCC(id)),
)

const targetDispelAbilityIds = compiletime(
    [
        "Acyc",
        "SCc1",
        "ACcy",
        "Acny",
        "Aams",
        "ACam",
        "AIcy",
        "Aprg",
        "Apg2",
        "Aadm",
        "ACpu",
        "ACdm",
        "ACd2",
        "Andm",
        "AIlp",
        "AIpg",
        "AIps",
    ].map((id) => fourCC(id)),
)

const pointDispelAbilityIds = compiletime(
    ["Adis", "Adcn", "Adch", "Advm", "Adtn", "ACde", "Adsm", "AIdi", "AIds", "APdi"].map((id) =>
        fourCC(id),
    ),
)

const checkBuffs = (unit: Unit, dispel?: boolean, dispelSource?: Unit): void => {
    for (const [, buff] of buffs.get(unit)) {
        const preset = buff["preset"]
        const handle = buff["handle"]
        if (
            handle != undefined &&
            preset != undefined &&
            BlzGetUnitAbility(unit.handle, preset.buffId) != handle
        ) {
            if (dispel == true && preset.magic) {
                buff["onDispel"](dispelSource)
            }
            buff.destroy()
        }
    }
}

Unit.abilityChannelingStartEvent[fourCC("AOvd")].addListener((caster, ability) => {
    const targets = Unit.getInCollisionRange(
        caster.x,
        caster.y,
        ability.getField(ABILITY_RLF_AREA_OF_EFFECT),
    )
    Timer.run(() => {
        for (const target of targets) {
            checkBuffs(target, true, caster)
        }
    })
})

for (const selfDispelAbilityId of selfDispelAbilityIds) {
    Unit.abilityChannelingStartEvent[selfDispelAbilityId].addListener((caster) => {
        Timer.run(() => {
            checkBuffs(caster, true, caster)
        })
    })
}

for (const targetDispelAbilityId of targetDispelAbilityIds) {
    Unit.onUnitTargetCast[targetDispelAbilityId].addListener((caster, ability, target) => {
        Timer.run(() => {
            checkBuffs(target, true, caster)
        })
    })
}

for (const pointDispelAbilityId of pointDispelAbilityIds) {
    Unit.onPointCast[pointDispelAbilityId].addListener((caster, ability, x, y) => {
        const targets = Unit.getInCollisionRange(x, y, ability.getField(ABILITY_RLF_AREA_OF_EFFECT))
        Timer.run(() => {
            for (const target of targets) {
                checkBuffs(target, true, caster)
            }
        })
    })
}

// Ray of Disruption
Unit.onDamaging.addListener((source, target, event) => {
    if (
        event.amount == 0 &&
        event.attackType == AttackType.SPELL &&
        event.damageType == DamageType.NORMAL &&
        !event.isAttack
    ) {
        Timer.run(() => {
            checkBuffs(target, true, source)
        })
    }
})

Unit.itemPickedUpEvent.addListener((unit, item) => {
    if (item.powerup && item.hasAbility(fourCC("APdi") as AbilityTypeId)) {
        // подумать
    }
})
