import { LevelFieldValueProvider, ObjectDefinition } from "./object"

import * as idgen from "./idgen"
import { AbilityDefinition } from "./ability"
import Classification = UnitDefinition.Classification

const attackTypes = setmetatable<
    Record<string, UnitWeaponDefinition.AttackType>,
    (this: Record<string, UnitWeaponDefinition.AttackType>, key: string) => "unknown"
>(
    {
        normal: "normal",
        pierce: "pierce",
        siege: "siege",
        spells: "spells",
        chaos: "chaos",
        magic: "magic",
        hero: "hero",
    },
    {
        __index() {
            return "unknown"
        },
    }
)

const weaponTypes = setmetatable<
    Record<string, UnitWeaponDefinition.WeaponType>,
    (this: Record<string, UnitWeaponDefinition.WeaponType>, key: string) => "none"
>(
    {
        none: "none",
        normal: "normal",
        instant: "instant",
        artillery: "artillery",
        aline: "aline",
        missile: "missile",
        msplash: "msplash",
        mbounce: "mbounce",
        mline: "mline",
    },
    {
        __index() {
            return "none"
        },
    }
)

export namespace UnitWeaponDefinition {
    export type AttackType =
        | "unknown"
        | "normal"
        | "pierce"
        | "siege"
        | "spells"
        | "chaos"
        | "magic"
        | "hero"

    export type WeaponType =
        | "none"
        | "normal"
        | "instant"
        | "artillery"
        | "aline"
        | "missile"
        | "msplash"
        | "mbounce"
        | "mline"
}

export namespace UnitDefinition {
    export type Classification =
        | "ancient"
        | "giant"
        | "mechanical"
        | "neutral"
        | "peon"
        | "sapper"
        | "standon"
        | "summoned"
        | "tauren"
        | "townhall"
        | "tree"
        | "undead"
        | "ward"
}

export class UnitWeaponDefinition extends ObjectDefinition {
    public constructor(object: WarObject, private readonly idx: 1 | 2) {
        super(object)
    }

    public set enabled(v: boolean) {
        this.setNumberField(
            "uaen",
            (this.getNumberField("uaen") & ~(1 << (this.idx - 1))) | ((v ? 1 : 0) << (this.idx - 1))
        )
    }

    public get enabled(): boolean {
        return (this.getNumberField("uaen") & (1 << (this.idx - 1))) != 0
    }

    public set attackBackswing(v: number) {
        this.setNumberField(`ubs${this.idx}`, v)
    }

    public get attackBackswing(): number {
        return this.getNumberField(`ubs${this.idx}`)
    }

    public set attackPoint(v: number) {
        this.setNumberField(`udp${this.idx}`, v)
    }

    public get attackPoint(): number {
        return this.getNumberField(`udp${this.idx}`)
    }

    public set cooldown(v: number) {
        this.setNumberField(`ua${this.idx}c`, v)
    }

    public get cooldown(): number {
        return this.getNumberField(`ua${this.idx}c`)
    }

    public set attackType(v: UnitWeaponDefinition.AttackType) {
        this.setStringField(`ua${this.idx}t`, v)
    }

    public get attackType(): UnitWeaponDefinition.AttackType {
        return attackTypes[this.getStringField(`ua${this.idx}t`)]
    }

    public set weaponType(v: UnitWeaponDefinition.WeaponType) {
        this.setStringField(`ua${this.idx}w`, v)
    }

    public get weaponType(): UnitWeaponDefinition.WeaponType {
        return weaponTypes[this.getStringField(`ua${this.idx}w`)]
    }

    public set baseDamage(v: number) {
        this.setNumberField(`ua${this.idx}b`, v)
    }

    public get baseDamage(): number {
        return this.getNumberField(`ua${this.idx}b`)
    }

    public set diceNumber(v: number) {
        this.setNumberField(`ua${this.idx}d`, v)
    }

    public get diceNumber(): number {
        return this.getNumberField(`ua${this.idx}d`)
    }

    public set diceSides(v: number) {
        this.setNumberField(`ua${this.idx}s`, v)
    }

    public get diceSides(): number {
        return this.getNumberField(`ua${this.idx}s`)
    }

    public set range(v: number) {
        this.setNumberField(`ua${this.idx}r`, v)
    }

    public get range(): number {
        return this.getNumberField(`ua${this.idx}r`)
    }

    public set missileArt(v: string) {
        this.setStringField(`ua${this.idx}m`, v)
    }

    public get missileArt(): string {
        return this.getStringField(`ua${this.idx}m`)
    }

    public set missileArc(v: number) {
        this.setNumberField(`uma${this.idx}`, v)
    }

    public get missileArc(): number {
        return this.getNumberField(`uma${this.idx}`)
    }

    public set missileSpeed(v: number) {
        this.setNumberField(`ua${this.idx}z`, v)
    }

    public get missileSpeed(): number {
        return this.getNumberField(`ua${this.idx}z`)
    }

    public set missileHoming(v: boolean) {
        this.setBooleanField(`umh${this.idx}`, v)
    }

    public get missileHoming(): boolean {
        return this.getBooleanField(`umh${this.idx}`)
    }

    public set targetsAllowed(v: AbilityDefinition.TargetType[]) {
        this.setStringField(`ua${this.idx}g`, v.join())
    }

    public get targetsAllowed(): AbilityDefinition.TargetType[] {
        return this.getStringField(`ua${this.idx}g`).split(",") as AbilityDefinition.TargetType[]
    }
}

export class UnitDefinition extends ObjectDefinition {
    public readonly id: string

    public readonly weapons = [
        new UnitWeaponDefinition(this.object, 1),
        new UnitWeaponDefinition(this.object, 2),
    ] as const

    public constructor(
        baseId: string,
        id?: string,
        ctor?: Readonly<Partial<Omit<UnitDefinition, "id">>>
    ) {
        super(currentMap!.objects.unit.newObject(id ?? idgen.unit(), baseId))
        this.id = this.object.id
        for (const [key, value] of pairs(ctor ?? {})) {
            this[key] = value as never
        }
    }

    public set name(v: string) {
        this.setStringField("unam", v)
    }

    public get name(): string {
        return this.getStringField("unam")
    }

    public set tooltip(v: string) {
        this.setStringField("utip", v)
    }

    public get tooltip(): string {
        return this.getStringField("utip")
    }

    public set tooltipExtended(v: string) {
        this.setStringField("utub", v)
    }

    public get tooltipExtended(): string {
        return this.getStringField("utub")
    }

    public set foodCost(v: number) {
        this.setNumberField("ufoo", v)
    }

    public get foodCost(): number {
        return this.getNumberField("ufoo")
    }

    public set foodProduced(v: number) {
        this.setNumberField("ufma", v)
    }

    public get foodProduced(): number {
        return this.getNumberField("ufma")
    }

    public set missileLaunchX(v: number) {
        this.setNumberField("ulpx", v)
    }

    public get missileLaunchX(): number {
        return this.getNumberField("ulpx")
    }

    public set missileLaunchY(v: number) {
        this.setNumberField("ulpy", v)
    }

    public get missileLaunchY(): number {
        return this.getNumberField("ulpy")
    }

    public set missileLaunchZ(v: number) {
        this.setNumberField("ulpz", v)
    }

    public get missileLaunchZ(): number {
        return this.getNumberField("ulpz")
    }

    public set movementHeight(v: number) {
        this.setNumberField("umvh", v)
    }

    public get movementHeight(): number {
        return this.getNumberField("umvh")
    }

    public set movementHeightMinimum(v: number) {
        this.setNumberField("umvf", v)
    }

    public get movementHeightMinimum(): number {
        return this.getNumberField("umvf")
    }

    public set speed(v: number) {
        this.setNumberField("umvs", v)
    }

    public get speed(): number {
        return this.getNumberField("umvs")
    }

    public set speedMaximum(v: number) {
        this.setNumberField("umas", v)
    }

    public get speedMaximum(): number {
        return this.getNumberField("umas")
    }

    public set speedMinimum(v: number) {
        this.setNumberField("umis", v)
    }

    public get speedMinimum(): number {
        return this.getNumberField("umis")
    }

    public set turnRate(v: number) {
        this.setNumberField("umvr", v)
    }

    public get turnRate(): number {
        return this.getNumberField("umvr")
    }

    public set movementType(v: "none" | "foot" | "horse" | "fly" | "hover" | "float" | "amph") {
        this.setStringField("umvt", v)
    }

    public get movementType(): "none" | "foot" | "horse" | "fly" | "hover" | "float" | "amph" {
        const type = this.getStringField("umvt")
        if (
            type == "foot" ||
            type == "horse" ||
            type == "fly" ||
            type == "hover" ||
            type == "float" ||
            type == "amph"
        ) {
            return type
        }
        return "none"
    }

    public get armorSound(): "ethereal" | "flesh" | "metal" | "stone" | "wood" {
        const sound = this.getStringField("uarm").toLowerCase()
        if (
            sound == "ethereal" ||
            sound == "flesh" ||
            sound == "metal" ||
            sound == "stone" ||
            sound == "wood"
        ) {
            return sound
        }
        return "ethereal"
    }

    public set armorSound(v: "ethereal" | "flesh" | "metal" | "stone" | "wood") {
        this.setStringLevelField("uarm", v[0].toUpperCase() + v.substring(1))
    }

    public set sightRadiusDay(v: number) {
        this.setNumberField("usid", v)
    }

    public get sightRadiusDay(): number {
        return this.getNumberField("usid")
    }

    public set sightRadiusNight(v: number) {
        this.setNumberField("usin", v)
    }

    public get sightRadiusNight(): number {
        return this.getNumberField("usin")
    }

    public get icon(): string {
        return this.getStringField("uico")
    }

    public set icon(v: string) {
        this.setStringField("uico", v)
    }

    public get iconHD(): string {
        return this.getStringField("uico:hd")
    }

    public set iconHD(v: string | undefined) {
        this.object.setField("uico:hd", v)
    }

    public get model(): string {
        return this.getStringField("umdl")
    }

    public set model(v: string) {
        this.setStringField("umdl", v)
    }

    public get modelHD(): string {
        return this.getStringField("umdl:hd")
    }

    public set modelHD(v: string | undefined) {
        this.object.setField("umdl:hd", v)
    }

    public get selectionScale(): number {
        return this.getNumberField("ussc")
    }

    public set selectionScale(v: number) {
        this.setNumberField("ussc", v)
    }

    public get collisionSize(): number {
        return this.getNumberField("ucol")
    }

    public set collisionSize(v: number) {
        this.setNumberField("ucol", v)
    }

    public get scale(): number {
        return this.getNumberField("usca")
    }

    public set scale(v: number) {
        this.setNumberField("usca", v)
    }

    public get scaleMissiles(): boolean {
        return this.getBooleanField("uscb")
    }

    public set scaleMissiles(v: boolean) {
        this.setBooleanField("uscb", v)
    }

    public get deathTime(): number {
        return this.getNumberField("udtm")
    }

    public set deathTime(v: number) {
        this.setNumberField("udtm", v)
    }

    public set blendTime(v: number) {
        this.setNumberField("uble", v)
    }

    public get blendTime(): number {
        return this.getNumberField("uble")
    }

    public set castBackswing(v: number) {
        this.setNumberField("ucbs", v)
    }

    public get castBackswing(): number {
        return this.getNumberField("ucbs")
    }

    public set castPoint(v: number) {
        this.setNumberField("ucpt", v)
    }

    public get castPoint(): number {
        return this.getNumberField("ucpt")
    }

    public set abilitiesNormal(v: (string | number)[]) {
        const value = v.map((v) => util.id2s(v)).join(",")
        this.setStringField("uabi", value)
        this.setStringField("uabs", value)
    }

    public get abilitiesNormal(): string[] {
        return this.getStringField("uabi").split(",")
    }

    public set maxHealth(v: number) {
        this.setNumberField("uhpm", v)
    }

    public get maxHealth(): number {
        return this.getNumberField("uhpm")
    }

    public set maxMana(v: number) {
        this.setNumberField("umpm", v)
    }

    public get maxMana(): number {
        return this.getNumberField("umpm")
    }

    public get soundSet(): string {
        return this.getStringField("usnd")
    }

    public set soundSet(soundSet: string) {
        this.setStringField("usnd", soundSet)
    }

    public get specialArt(): string {
        return this.getStringField("uspa")
    }

    public set specialArt(specialArt: string) {
        this.setStringField("uspa", specialArt)
    }

    public get raisable(): boolean {
        return (this.getNumberField("udea") & 1) != 0
    }

    public set raisable(raisable: boolean) {
        if (raisable) {
            this.setNumberField("udea", this.getNumberField("udea") | 1)
        } else {
            this.setNumberField("udea", this.getNumberField("udea") & ~1)
        }
    }

    public get decayable(): boolean {
        return (this.getNumberField("udea") & 2) != 0
    }

    public set decayable(decayable: boolean) {
        if (decayable) {
            this.setNumberField("udea", this.getNumberField("udea") | 2)
        } else {
            this.setNumberField("udea", this.getNumberField("udea") & ~2)
        }
    }

    public get classifications(): Classification[] {
        return this.getStringField("utyp").split(",") as Classification[]
    }

    public set classifications(classifications: Classification[]) {
        this.setStringField("utyp", classifications.join(","))
    }
}

export class HeroDefinition extends UnitDefinition {
    public constructor(baseId: string, id?: string) {
        super(baseId, id ?? idgen.hero())
    }

    public set properNames(v: string[]) {
        this.setStringField("upro", v.join(","))
        this.setNumberField("upru", v.length)
    }

    public get properNames(): string[] {
        return this.getStringField("upro").split(",")
    }

    public set abilitiesHero(v: (string | number)[]) {
        const value = v.map((v) => util.id2s(v)).join(",")
        this.setStringField("uhab", value)
        this.setStringField("uhas", value)
    }

    public get abilitiesHero(): string[] {
        return this.getStringField("uhab").split(",")
    }
}
