import { LevelFieldValueProvider, ObjectDefinition } from "./object"

import { TargetingType } from "../engine/object-data/auxiliary/targeting-type"
import { OrderTypeStringIdFactory } from "../engine/object-data/utility/order-type-string-id-factory"

import * as idgen from "./idgen"

export namespace AbilityDefinition {
    export type TargetType = ObjectDefinition.TargetType
}

type Art = {
    model: string
    attachmentPoint: string
}

type ArtInput = string | Art

export class AbilityDefinition extends ObjectDefinition {
    public readonly id: string

    public constructor(baseId: string | number, id?: string | number) {
        super(
            currentMap!.objects.ability.newObject(
                util.id2s(id ?? idgen.ability()),
                util.id2s(baseId)
            )
        )
        this.id = this.object.id
    }

    public static create<T extends AbilityDefinition>(
        this: new (object: WarObject) => T,
        baseId: string | number,
        id?: string | number
    ): T {
        return new this(
            currentMap!.objects.ability.newObject(
                util.id2s(id ?? idgen.ability()),
                util.id2s(baseId)
            )
        )
    }

    public static of<T extends AbilityDefinition>(
        this: new (object: WarObject) => T,
        id: string | number
    ): T {
        return new this(currentMap!.objects.ability.getObject(util.id2s(id)))
    }

    public set name(v: string) {
        this.setStringField("anam", v)
    }

    public get name(): string {
        return this.getStringField("anam")
    }

    public set tooltip(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("atp1", v)
    }

    public get tooltip(): string[] {
        return this.getStringLevelField("atp1")
    }

    public set tooltipExtended(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("aub1", v)
    }

    public get tooltipExtended(): string[] {
        return this.getStringLevelField("aub1")
    }

    public set hotkey(v: string) {
        this.setStringField("arhk", v)
        this.setStringField("ahky", v)
        this.setStringField("auhk", v)
    }

    public get hotkey(): string {
        return this.getStringField("ahky")
    }

    public set buttonPositionX(v: 0 | 1 | 2 | 3) {
        this.setNumberField("abpx", v)
    }

    public get buttonPositionX(): 0 | 1 | 2 | 3 {
        return this.getNumberField("abpx") as 0 | 1 | 2 | 3
    }

    public set buttonPositionY(v: 0 | 1 | 2) {
        this.setNumberField("abpy", v)
    }

    public get buttonPositionY(): 0 | 1 | 2 {
        return this.getNumberField("abpy") as 0 | 1 | 2
    }

    public set levels(v: number) {
        this.setNumberField("alev", v)
    }

    public get levels(): number {
        return this.getNumberField("alev")
    }

    public set requiredLevel(v: number) {
        this.setNumberField("arlv", v)
    }

    public get requiredLevel(): number {
        return this.getNumberField("arlv")
    }

    public set heroAbility(v: boolean) {
        this.setBooleanField("aher", v)
    }

    public get heroAbility(): boolean {
        return this.getBooleanField("aher")
    }

    public set buffs(v: LevelFieldValueProvider<(string | number)[]>) {
        this.setStringLevelField("abuf", (level, value) => {
            return AbilityDefinition.getLevelArrayFieldValue(level, value.split(","), v)
                .map((id) => util.id2s(id))
                .join()
            /*if (Array.isArray(v)) {
                const levelValue = v[level]
                if (Array.isArray(levelValue)) {
                    return levelValue.join(",")
                } else {
                    return v.join(",")
                }
            } else {
                return v(level, value.split(",")).join(",")
            }*/
        })
    }

    public get buffs(): string[][] {
        return this.getStringListLevelField("abuf")
    }

    public set effects(v: LevelFieldValueProvider<(string | number)[]>) {
        this.setStringLevelField("aeff", (level, value) => {
            return AbilityDefinition.getLevelArrayFieldValue(level, value.split(","), v)
                .map((id) => util.id2s(id))
                .join()
        })
    }

    public get effects(): string[][] {
        return this.getStringListLevelField("aeff")
    }

    public set durationNormal(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("adur", v)
    }

    public get durationNormal(): number[] {
        return this.getNumberLevelField("adur")
    }

    public set durationHero(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("ahdu", v)
    }

    public get durationHero(): number[] {
        return this.getNumberLevelField("ahdu")
    }

    public set castTime(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("acas", v)
    }

    public get castTime(): number[] {
        return this.getNumberLevelField("acas")
    }

    public set cooldown(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("acdn", v)
    }

    public get cooldown(): number[] {
        return this.getNumberLevelField("acdn")
    }

    public set manaCost(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("amcs", v)
    }

    public get manaCost(): number[] {
        return this.getNumberLevelField("amcs")
    }

    public set areaOfEffect(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("aare", v)
    }

    public get areaOfEffect(): number[] {
        return this.getNumberLevelField("aare")
    }

    public set castRange(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("aran", v)
    }

    public get castRange(): number[] {
        return this.getNumberLevelField("aran")
    }

    public set targetsAllowed(v: LevelFieldValueProvider<AbilityDefinition.TargetType[]>) {
        this.setStringLevelField("atar", (level, value) => {
            return AbilityDefinition.getLevelArrayFieldValue(
                level,
                value.split(",") as AbilityDefinition.TargetType[],
                v
            ).join()
            /*if (Array.isArray(v)) {
                const levelValue = v[level]
                if (Array.isArray(levelValue)) {
                    return levelValue.join(",")
                } else {
                    return v.join(",")
                }
            } else {
                return v(level, value.split(",")).join(",")
            }*/
        })
    }

    public get targetsAllowed(): AbilityDefinition.TargetType[][] {
        return this.getStringLevelField("atar").map(
            (buff) => buff.split(",") as AbilityDefinition.TargetType[]
        )
    }

    public get icon(): string {
        return this.getStringField("aart")
    }

    public set icon(v: string) {
        this.setStringField("aart", v)
    }

    public get turnOffIcon(): string {
        return this.getStringField("auar")
    }

    public set turnOffIcon(v: string) {
        this.setStringField("auar", v)
    }

    public get researchIcon(): string {
        return this.getStringField("arar")
    }

    public set researchIcon(v: string) {
        this.setStringField("arar", v)
    }

    public set animationNames(v: string[]) {
        this.setStringField("aani", v.join(","))
    }

    public get animationNames(): string[] {
        return this.getStringField("aani").split(",")
    }

    public set casterArt(v: string) {
        this.setStringField("acat", v)
    }

    public get casterArt(): string {
        return this.getStringField("acat")
    }

    public set effectArt(v: string) {
        this.setStringField("aeat", v)
    }

    public get effectArt(): string {
        return this.getStringField("aeat")
    }

    public get specialArt(): Art {
        return {
            model: this.getStringField("asat"),
            attachmentPoint: this.getStringField("aspt"),
        }
    }

    public set specialArt(v: ArtInput) {
        if (typeof v == "string") {
            this.setStringField("asat", v)
            this.setStringField("aspt", "")
        } else {
            this.setStringField("asat", v.model)
            this.setStringField("aspt", v.attachmentPoint)
        }
    }

    public get targetArt(): [
        ...(
            | [
                  Art,
                  ...(
                      | [Art, ...([Art, ...([Art, ...([Art, ...([Art] | [])] | [])] | [])] | [])]
                      | []
                  )
              ]
            | []
        )
    ] {
        const models = this.getStringField("atat").split(",")
        const arts: Art[] = []
        for (const i of $range(1, models.length)) {
            const attachmentPoint = this.getStringField(`ata${i - 1}`) ?? ""
            arts[i - 1] = {
                model: models[i - 1],
                attachmentPoint: attachmentPoint == "" ? "origin" : attachmentPoint,
            }
        }
        return arts as any
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
                                                          ...([ArtInput, ...([ArtInput] | [])] | [])
                                                      ]
                                                    | []
                                                )
                                            ]
                                          | []
                                      )
                                  ]
                                | []
                            )
                        ]
                      | []
                  )
              ]
    ) {
        if (Array.isArray(v)) {
            this.setStringField(
                "atat",
                v.map((art) => (typeof art == "string" ? art : art.model)).join(",")
            )
            let attachmentPoints = v.map((art) =>
                typeof art == "string" ? "origin" : art.attachmentPoint
            )
            if (
                attachmentPoints.filter(
                    (attachmentPoint) => attachmentPoint == "origin" || attachmentPoint == ""
                ).length == attachmentPoints.length
            ) {
                attachmentPoints = []
            }
            for (const i of $range(0, 5)) {
                this.setStringField(`ata${i}`, attachmentPoints[i] ?? "")
            }
            this.setNumberField("atac", attachmentPoints.length == 1 ? 0 : attachmentPoints.length)
        } else {
            this.setStringField("atat", typeof v == "string" ? v : v.model)
            this.setStringField("ata0", typeof v == "string" ? "" : v.attachmentPoint)
            for (const i of $range(1, 5)) {
                this.setStringField(`ata${i}`, "")
            }
            this.setNumberField("atac", 0)
        }
    }

    public set lightningEffects(v: string[]) {
        this.setStringField("alig", v.join(","))
    }

    public get lightningEffects(): string[] {
        return this.getStringField("alig").split(",")
    }

    public set missileArt(v: string) {
        this.setStringField("amat", v)
    }

    public get missileArt(): string {
        return this.getStringField("amat")
    }

    public set missileArc(v: number) {
        this.setNumberField("amac", v)
    }

    public get missileArc(): number {
        return this.getNumberField("amac")
    }

    public set missileSpeed(v: number) {
        this.setNumberField("amsp", v)
    }

    public get missileSpeed(): number {
        return this.getNumberField("amsp")
    }

    public set missileHoming(v: boolean) {
        this.setBooleanField("amho", v)
    }

    public get missileHoming(): boolean {
        return this.getBooleanField("amho")
    }

    public get checkDependencies(): boolean {
        return this.getBooleanField("achd")
    }

    public set checkDependencies(v: boolean) {
        this.setBooleanField("achd", v)
    }

    public get requirements(): { id: string; level: number }[] {
        const levels = this.getStringListField("arqa").map((level) => tonumber(level))
        return this.getStringListField("areq").map((id, i) => {
            return {
                id: id,
                level: levels[i] ?? 1,
            }
        })
    }

    public set requirements(v: (string | number | { id: string | number; level?: number })[]) {
        const requirements = v
            .map((requirement) => {
                if (typeof requirement != "object") {
                    return util.id2s(requirement)
                }
                return util.id2s(requirement.id)
            })
            .join(",")
        const levels: number[] = []
        for (const tail of $range(v.length, 1, -1)) {
            const tailRequirement = v[tail - 1]
            if (typeof tailRequirement == "object" && (tailRequirement.level ?? 1) != 1) {
                for (const i of $range(1, tail)) {
                    const requirement = v[i - 1]
                    levels[i - 1] = typeof requirement != "object" ? 1 : requirement.level ?? 1
                }
                break
            }
        }
        this.setStringField("areq", requirements)
        this.setStringField("arqa", levels.join(","))
    }
}

export class AbilityDefinitionSpikedCarapace extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AUts", id)
    }

    public set returnedDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Uts1", v)
    }

    public get returnedDamageFactor(): number[] {
        return this.getNumberLevelField("Uts1")
    }

    public set receivedDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Uts2", v)
    }

    public get receivedDamageFactor(): number[] {
        return this.getNumberLevelField("Uts2")
    }

    public set armorBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Uts3", v)
    }

    public get armorBonus(): number[] {
        return this.getNumberLevelField("Uts3")
    }
}

export class AbilityDefinitionAnimateDead extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AUan", id)
    }

    public get numberOfCorpsesRaised(): number[] {
        return this.getNumberLevelField("Uan1")
    }

    public set numberOfCorpsesRaised(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Uan1", v)
    }

    public get raisedUnitsAreInvulnerable(): boolean[] {
        return this.getBooleanLevelField("Hre2")
    }

    public set raisedUnitsAreInvulnerable(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Hre2", v)
    }

    public get inheritUpgrades(): boolean[] {
        return this.getBooleanLevelField("Uan3")
    }

    public set inheritUpgrades(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Uan3", v)
    }
}

export class AbilityDefinitionArmorBonus extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AId0", id)
    }

    public get armorBonus(): number[] {
        return this.getNumberLevelField("Idef")
    }

    public set armorBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Idef", v)
    }
}

export class AbilityDefinitionAttackSpeedBonus extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AIsx", id)
    }

    public get attackSpeedIncrease(): number[] {
        return this.getNumberLevelField("Isx1")
    }

    public set attackSpeedIncrease(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Isx1", v)
    }
}

export class AbilityDefinitionBanish extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AHbn", id)
    }

    public get movementSpeedReduction(): number[] {
        return this.getNumberLevelField("Hbn1")
    }

    public set movementSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbn1", v)
    }

    public get attackSpeedReduction(): number[] {
        return this.getNumberLevelField("Hbn2")
    }

    public set attackSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbn2", v)
    }
}

export class AbilityDefinitionBash extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AHbh", id)
    }

    public get chanceToBash(): number[] {
        return this.getNumberLevelField("Hbh1")
    }

    public set chanceToBash(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbh1", v)
    }

    public get damageFactor(): number[] {
        return this.getNumberLevelField("Hbh2")
    }

    public set damageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbh2", v)
    }

    public get damageBonus(): number[] {
        return this.getNumberLevelField("Hbh3")
    }

    public set damageBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbh3", v)
    }

    public get chanceToMiss(): number[] {
        return this.getNumberLevelField("Hbh4")
    }

    public set chanceToMiss(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbh4", v)
    }

    public get neverMiss(): boolean[] {
        return this.getBooleanLevelField("Hbh5")
    }

    public set neverMiss(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Hbh5", v)
    }
}

export class AbilityDefinitionBarrage extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aroc", id)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Efk1")
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Efk1", v)
    }

    public get maximumDamage(): number[] {
        return this.getNumberLevelField("Efk2")
    }

    public set maximumDamage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Efk2", v)
    }

    public get numberOfTargets(): number[] {
        return this.getNumberLevelField("Efk3")
    }

    public set numberOfTargets(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Efk3", v)
    }
}

export class AbilityDefinitionBerserk extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Absk", id)
    }

    public get movementSpeedIncrease(): number[] {
        return this.getNumberLevelField("bsk1")
    }

    public set movementSpeedIncrease(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("bsk1", v)
    }

    public get attackSpeedIncrease(): number[] {
        return this.getNumberLevelField("bsk2")
    }

    public set attackSpeedIncrease(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("bsk2", v)
    }

    public get damageTakenIncrease(): number[] {
        return this.getNumberLevelField("bsk3")
    }

    public set damageTakenIncrease(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("bsk3", v)
    }
}

export class AbilityDefinitionBlink extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AEbl", id)
    }

    public set maximumRange(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ebl1", v)
    }

    public get maximumRange(): number[] {
        return this.getNumberLevelField("Ebl1")
    }

    public set minimumRange(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ebl2", v)
    }

    public get minimumRange(): number[] {
        return this.getNumberLevelField("Ebl2")
    }
}

export class AbilityDefinitionBlizzard extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AHbz", id)
    }

    public set numberOfWaves(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbz1", v)
    }

    public get numberOfWaves(): number[] {
        return this.getNumberLevelField("Hbz1")
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbz2", v)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Hbz2")
    }

    public set numberOfShards(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbz3", v)
    }

    public get numberOfShards(): number[] {
        return this.getNumberLevelField("Hbz3")
    }

    public set buildingReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbz4", v)
    }

    public get buildingReduction(): number[] {
        return this.getNumberLevelField("Hbz4")
    }

    public set damagePerSecond(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbz5", v)
    }

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Hbz5")
    }

    public set maximumDamagePerWave(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hbz6", v)
    }

    public get maximumDamagePerWave(): number[] {
        return this.getNumberLevelField("Hbz6")
    }
}

export class AbilityDefinitionCripple extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Acri", id)
    }

    public get movementSpeedReduction(): number[] {
        return this.getNumberLevelField("Cri1")
    }

    public set movementSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Cri1", v)
    }

    public get attackSpeedReduction(): number[] {
        return this.getNumberLevelField("Cri2")
    }

    public set attackSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Cri2", v)
    }

    public get damageReduction(): number[] {
        return this.getNumberLevelField("Cri3")
    }

    public set damageReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Cri3", v)
    }
}

export class AbilityDefinitionCriticalStrike extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AOcr", id)
    }

    public get chanceToCriticalStrike(): number[] {
        return this.getNumberLevelField("Ocr1")
    }

    public set chanceToCriticalStrike(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocr1", v)
    }

    public get damageFactor(): number[] {
        return this.getNumberLevelField("Ocr2")
    }

    public set damageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocr2", v)
    }

    public get damageBonus(): number[] {
        return this.getNumberLevelField("Ocr3")
    }

    public set damageBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocr3", v)
    }

    public get chanceToEvade(): number[] {
        return this.getNumberLevelField("Ocr4")
    }

    public set chanceToEvade(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocr4", v)
    }

    public get neverMiss(): boolean[] {
        return this.getBooleanLevelField("Ocr5")
    }

    public set neverMiss(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Ocr5", v)
    }

    public get excludeItemDamage(): boolean[] {
        return this.getBooleanLevelField("Ocr6")
    }

    public set excludeItemDamage(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Ocr6", v)
    }
}

export class AbilityDefinitionMeleeColdDamageBonus extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AIft", id)
    }

    public set damageBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Idam", v)
    }

    public get damageBonus(): number[] {
        return this.getNumberLevelField("Idam")
    }

    public set enabledWeaponIndex(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Iob5", v)
    }

    public get enabledWeaponIndex(): number[] {
        return this.getNumberLevelField("Iob5")
    }
}

export class AbilityDefinitionChainLightning extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AOcl", id)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Ocl1")
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocl1", v)
    }

    public get numberOfTargets(): number[] {
        return this.getNumberLevelField("Ocl2")
    }

    public set numberOfTargets(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocl2", v)
    }

    public get damageReduction(): number[] {
        return this.getNumberLevelField("Ocl3")
    }

    public set damageReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocl3", v)
    }
}

export class AbilityDefinitionCyclone extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Acyc", id)
    }

    public get canBeDispelled(): boolean[] {
        return this.getBooleanLevelField("cyc1")
    }

    public set canBeDispelled(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("cyc1", v)
    }
}

export class AbilityDefinitionDamageBonus extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AIat", id)
    }

    public get damageBonus(): number[] {
        return this.getNumberLevelField("Iatt")
    }

    public set damageBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Iatt", v)
    }
}

export class AbilityDefinitionDefend extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Adef", id)
    }

    public get receivedPiercingDamageFactor(): number[] {
        return this.getNumberLevelField("Def1")
    }

    public set receivedPiercingDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def1", v)
    }

    public get returnedDamageFactor(): number[] {
        return this.getNumberLevelField("Def2")
    }

    public set returnedDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def2", v)
    }

    public get movementSpeedReduction(): number[] {
        return this.getNumberLevelField("Def3")
    }

    public set movementSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def3", v)
    }

    public get attackSpeedReduction(): number[] {
        return this.getNumberLevelField("Def4")
    }

    public set attackSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def4", v)
    }

    public get receivedMagicDamageFactor(): number[] {
        return this.getNumberLevelField("Def5")
    }

    public set receivedMagicDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def5", v)
    }

    public get chanceToDeflect(): number[] {
        return this.getNumberLevelField("Def6")
    }

    public set chanceToDeflect(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def6", v)
    }

    public get receivedDeflectedPiercingDamageFactor(): number[] {
        return this.getNumberLevelField("Def7")
    }

    public set receivedDeflectedPiercingDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def7", v)
    }
}

export class AbilityDefinitionDefendPassive extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AIdd", id)
    }

    public get receivedPiercingDamageFactor(): number[] {
        return this.getNumberLevelField("Def1")
    }

    public set receivedPiercingDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def1", v)
    }

    public get returnedDamageFactor(): number[] {
        return this.getNumberLevelField("Def2")
    }

    public set returnedDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def2", v)
    }

    public get movementSpeedReduction(): number[] {
        return this.getNumberLevelField("Def3")
    }

    public set movementSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def3", v)
    }

    public get attackSpeedReduction(): number[] {
        return this.getNumberLevelField("Def4")
    }

    public set attackSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def4", v)
    }

    public get receivedMagicDamageFactor(): number[] {
        return this.getNumberLevelField("Def5")
    }

    public set receivedMagicDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def5", v)
    }

    public get chanceToDeflect(): number[] {
        return this.getNumberLevelField("Def6")
    }

    public set chanceToDeflect(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def6", v)
    }

    public get receivedDeflectedPiercingDamageFactor(): number[] {
        return this.getNumberLevelField("Def7")
    }

    public set receivedDeflectedPiercingDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def7", v)
    }
}

export class AbilityDefinitionDiseaseCloudAbomination extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aap1", id)
    }

    public get auraDuration(): number[] {
        return this.getNumberLevelField("Apl1")
    }

    public set auraDuration(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Apl1", v)
    }

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Apl2")
    }

    public set damagePerSecond(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Apl2", v)
    }

    public get plagueWardDuration(): number[] {
        return this.getNumberLevelField("Apl3")
    }

    public set plagueWardDuration(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Apl3", v)
    }

    public get plagueWardUnitTypeId(): string[] {
        return this.getStringLevelField("Aplu")
    }

    public set plagueWardUnitTypeId(v: LevelFieldValueProvider<string | number>) {
        this.setStringLevelField("Aplu", (level, value) => {
            return util.id2s(AbilityDefinition.getLevelFieldValue(level, value, v))
        })
    }
}

export class AbilityDefinitionDrunkenHaze extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("ANdh", id)
    }

    public get attacksPrevented(): number[] {
        return this.getNumberLevelField("Nsi1")
    }

    public set attacksPrevented(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nsi1", v)
    }

    public get chanceToMiss(): number[] {
        return this.getNumberLevelField("Nsi2")
    }

    public set chanceToMiss(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nsi2", v)
    }

    public get movementSpeedModifier(): number[] {
        return this.getNumberLevelField("Nsi3")
    }

    public set movementSpeedModifier(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nsi3", v)
    }

    public get attackSpeedModifier(): number[] {
        return this.getNumberLevelField("Nsi4")
    }

    public set attackSpeedModifier(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nsi4", v)
    }
}

export class AbilityDefinitionElunesGrace extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aegr", id)
    }

    public get receivedDamageFactor(): number[] {
        return this.getNumberLevelField("Def1")
    }

    public set receivedDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def1", v)
    }

    public get returnedDamageFactor(): number[] {
        return this.getNumberLevelField("Def2")
    }

    public set returnedDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def2", v)
    }

    public get movementSpeedReduction(): number[] {
        return this.getNumberLevelField("Def3")
    }

    public set movementSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def3", v)
    }

    public get attackSpeedReduction(): number[] {
        return this.getNumberLevelField("Def4")
    }

    public set attackSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def4", v)
    }

    public get receivedMagicDamageFactor(): number[] {
        return this.getNumberLevelField("Def5")
    }

    public set receivedMagicDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def5", v)
    }

    public get chanceToDeflect(): number[] {
        return this.getNumberLevelField("Def6")
    }

    public set chanceToDeflect(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def6", v)
    }

    public get deflectedReceivedPiercingDamageFactor(): number[] {
        return this.getNumberLevelField("Def7")
    }

    public set deflectedReceivedPiercingDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def7", v)
    }

    public get deflectedReceivedSpellDamageFactor(): number[] {
        return this.getNumberLevelField("Def8")
    }

    public set deflectedReceivedSpellDamageFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Def8", v)
    }
}

export class AbilityDefinitionEnsnare extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aens", id)
    }

    public get airUnitLowerDuration(): number[] {
        return this.getNumberLevelField("Ens1")
    }

    public set airUnitLowerDuration(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ens1", v)
    }

    public get airUnitLowerHeight(): number[] {
        return this.getNumberLevelField("Ens2")
    }

    public set airUnitLowerHeight(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ens2", v)
    }

    public get meleeAttackRange(): number[] {
        return this.getNumberLevelField("Ens3")
    }

    public set meleeAttackRange(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ens3", v)
    }
}

export class AbilityDefinitionEntanglingRoots extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AEer", id)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Eer1")
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Eer1", v)
    }
}

export class AbilityDefinitionExhumeCorpses extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aexh", id)
    }

    public get maximumNumberOfCorpses(): number[] {
        return this.getNumberLevelField("exh1")
    }

    public set maximumNumberOfCorpses(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("exh1", v)
    }

    public get unitTypeId(): string[] {
        return this.getStringLevelField("exhu")
    }

    public set unitTypeId(v: LevelFieldValueProvider<string | number>) {
        this.setStringLevelField("exhu", (level, value) => {
            return util.id2s(AbilityDefinition.getLevelFieldValue(level, value, v))
        })
    }
}

export class AbilityDefinitionFaerieFire extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Afae", id)
    }

    public get armorReduction(): number[] {
        return this.getNumberLevelField("Fae1")
    }

    public set armorReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Fae1", v)
    }

    public get alwaysAutocast(): boolean[] {
        return this.getBooleanLevelField("Fae2")
    }

    public set alwaysAutocast(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Fae2", v)
    }
}

export class AbilityDefinitionFirebolt extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("ANfb", id)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Htb1")
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Htb1", v)
    }
}

export class AbilityDefinitionForkedLightning extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("ANfl", id)
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocl1", v)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Ocl1")
    }

    public set numberOfTargets(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocl2", v)
    }

    public get numberOfTargets(): number[] {
        return this.getNumberLevelField("Ocl2")
    }

    public set distance(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ucs3", v)
    }

    public get distance(): number[] {
        return this.getNumberLevelField("Ucs3")
    }

    public set finalArea(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ucs4", v)
    }

    public get finalArea(): number[] {
        return this.getNumberLevelField("Ucs4")
    }
}

export class AbilityDefinitionFrenzy extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Afzy", id)
    }

    public get attackSpeedIncrease(): number[] {
        return this.getNumberLevelField("Blo1")
    }

    public set attackSpeedIncrease(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Blo1", v)
    }

    public get movementSpeedIncrease(): number[] {
        return this.getNumberLevelField("Blo2")
    }

    public set movementSpeedIncrease(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Blo2", v)
    }

    public get scaleIncrease(): number[] {
        return this.getNumberLevelField("Blo3")
    }

    public set scaleIncrease(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Blo3", v)
    }
}

export class AbilityDefinitionGhost extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Agho", id)
    }

    public get autoAcquireAttackTargets(): boolean[] {
        return this.getBooleanLevelField("Gho1")
    }

    public set autoAcquireAttackTargets(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Gho1", v)
    }

    public get immuneToMorphEffects(): boolean[] {
        return this.getBooleanLevelField("Gho2")
    }

    public set immuneToMorphEffects(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Gho2", v)
    }

    public get doesNotBlockBuildings(): boolean[] {
        return this.getBooleanLevelField("Gho3")
    }

    public set doesNotBlockBuildings(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Gho3", v)
    }
}

export class AbilityDefinitionGhostVisible extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aeth", id)
    }

    public get immuneToMorphEffects(): boolean[] {
        return this.getBooleanLevelField("Eth1")
    }

    public set immuneToMorphEffects(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Eth1", v)
    }

    public get doesNotBlockBuildings(): boolean[] {
        return this.getBooleanLevelField("Eth2")
    }

    public set doesNotBlockBuildings(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Eth2", v)
    }
}

export class AbilityDefinitionHardenedSkin extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Assk", id)
    }

    public get chanceToReduceDamage(): number[] {
        return this.getNumberLevelField("Ssk1")
    }

    public set chanceToReduceDamage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ssk1", v)
    }

    public get minimumDamage(): number[] {
        return this.getNumberLevelField("Ssk2")
    }

    public set minimumDamage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ssk2", v)
    }

    public get ignoredDamage(): number[] {
        return this.getNumberLevelField("Ssk3")
    }

    public set ignoredDamage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ssk3", v)
    }

    public get includeRangedDamage(): boolean[] {
        return this.getBooleanLevelField("Ssk4")
    }

    public set includeRangedDamage(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Ssk4", v)
    }

    public get includeMeleeDamage(): boolean[] {
        return this.getBooleanLevelField("Ssk5")
    }

    public set includeMeleeDamage(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Ssk5", v)
    }
}

enum AllowWhenFull {
    never = 0,
    life = 1,
    mana = 2,
    always = 3,
}

export class AbilityDefinitionHealingSalve extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AIrl", id)
    }

    public get lifeRegenerated(): number[] {
        return this.getNumberLevelField("irl1")
    }

    public set lifeRegenerated(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("irl1", v)
    }

    public get manaRegenerated(): number[] {
        return this.getNumberLevelField("irl2")
    }

    public set manaRegenerated(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("irl2", v)
    }

    public get allowWhenFull(): ("never" | "life" | "mana" | "always")[] {
        return this.getNumberLevelField("irl3").map(
            (value) => AllowWhenFull[value] as "never" | "life" | "mana" | "always"
        )
    }

    public set allowWhenFull(v: LevelFieldValueProvider<"never" | "life" | "mana" | "always">) {
        this.setNumberLevelField("irl3", (level, value) => {
            return AllowWhenFull[
                AbilityDefinition.getLevelFieldValue(
                    level,
                    AllowWhenFull[value] as "never" | "life" | "mana" | "always",
                    v
                )
            ]
        })
    }

    public get noTargetRequired(): boolean[] {
        return this.getBooleanLevelField("irl4")
    }

    public set noTargetRequired(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("irl4", v)
    }

    public get dispelOnAttack(): boolean[] {
        return this.getBooleanLevelField("irl5")
    }

    public set dispelOnAttack(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("irl5", v)
    }
}

export class AbilityDefinitionHealingWave extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AOhw", id)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Ocl1")
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocl1", v)
    }

    public get numberOfTargets(): number[] {
        return this.getNumberLevelField("Ocl2")
    }

    public set numberOfTargets(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocl2", v)
    }

    public get damageReduction(): number[] {
        return this.getNumberLevelField("Ocl3")
    }

    public set damageReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ocl3", v)
    }
}

export class AbilityDefinitionHealthBonus extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AIlf", id)
    }

    public get healthBonus(): number[] {
        return this.getNumberLevelField("Ilif")
    }

    public set healthBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ilif", v)
    }
}

export class AbilityDefinitionImmolation extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AEim", id)
    }

    public get damagePerInterval(): number[] {
        return this.getNumberLevelField("Eim1")
    }

    public set damagePerInterval(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Eim1", v)
    }

    public get manaDrainedPerSecond(): number[] {
        return this.getNumberLevelField("Eim2")
    }

    public set manaDrainedPerSecond(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Eim2", v)
    }

    public get bufferManaRequired(): number[] {
        return this.getNumberLevelField("Eim3")
    }

    public set bufferManaRequired(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Eim3", v)
    }
}

export class AbilityDefinitionInnerFire extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Ainf", id)
    }

    public get damageIncrease(): number[] {
        return this.getNumberLevelField("Inf1")
    }

    public set damageIncrease(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Inf1", v)
    }

    public set armorBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Inf2", v)
    }

    public get armorBonus(): number[] {
        return this.getNumberLevelField("Inf2")
    }

    public get autoCastRange(): number[] {
        return this.getNumberLevelField("Inf3")
    }

    public set autoCastRange(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Inf3", v)
    }

    public get healthRegenerationBonus(): number[] {
        return this.getNumberLevelField("Inf4")
    }

    public set healthRegenerationBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Inf4", v)
    }

    // TOOD: Inf5
}

export class AbilityDefinitionInvisibility extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aivs", id)
    }

    public get transitionTime(): number[] {
        return this.getNumberLevelField("Ivs1")
    }

    public set transitionTime(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ivs1", v)
    }
}

export class AbilityDefinitionInvulnerable extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Avul", id)
    }
}

export class AbilityDefinitionLifeDrain extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("ANdr", id)
    }

    public get healthDrained(): number[] {
        return this.getNumberLevelField("Ndr1")
    }

    public set healthDrained(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr1", v)
    }

    public get manaDrained(): number[] {
        return this.getNumberLevelField("Ndr2")
    }

    public set manaDrained(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr2", v)
    }

    public get drainInterval(): number[] {
        return this.getNumberLevelField("Ndr3")
    }

    public set drainInterval(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr3", v)
    }

    public get healthTransferredPerSecond(): number[] {
        return this.getNumberLevelField("Ndr4")
    }

    public set healthTransferredPerSecond(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr4", v)
    }

    public get manaTransferredPerSecond(): number[] {
        return this.getNumberLevelField("Ndr5")
    }

    public set manaTransferredPerSecond(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr5", v)
    }

    public get bonusHealthFactor(): number[] {
        return this.getNumberLevelField("Ndr6")
    }

    public set bonusHealthFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr6", v)
    }

    public get bonusHealthDecay(): number[] {
        return this.getNumberLevelField("Ndr7")
    }

    public set bonusHealthDecay(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr7", v)
    }

    public get bonusManaFactor(): number[] {
        return this.getNumberLevelField("Ndr8")
    }

    public set bonusManaFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr8", v)
    }

    public get bonusManaDecay(): number[] {
        return this.getNumberLevelField("Ndr9")
    }

    public set bonusManaDecay(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ndr9", v)
    }

    public get useBlackArrowEffect(): boolean[] {
        return this.getBooleanLevelField("NdrA")
    }

    public set useBlackArrowEffect(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("NdrA", v)
    }
}

export class AbilityDefinitionLightningAttack extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Alit", id)
    }

    public get graphicDelay(): number[] {
        return this.getNumberLevelField("Lit1")
    }

    public set graphicDelay(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Lit1", v)
    }

    public get graphicDuration(): number[] {
        return this.getNumberLevelField("Lit2")
    }

    public set graphicDuration(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Lit2", v)
    }
}

export class AbilityDefinitionManaBonus extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AImb", id)
    }

    public get manaBonus(): number[] {
        return this.getNumberLevelField("Iman")
    }

    public set manaBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Iman", v)
    }
}

export class AbilityDefinitionMoveSpeedBonus extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AIms", id)
    }

    public get moveSpeedBonus(): number[] {
        return this.getNumberLevelField("Imvb")
    }

    public set moveSpeedBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Imvb", v)
    }
}

export class AbilityDefinitionAttackHealReductionBonus extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AIf2", id)
    }

    public get damageBonus(): number[] {
        return this.getNumberLevelField("Idam")
    }

    public set damageBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Idam", v)
    }

    public get enabledWeaponIndex(): number[] {
        return this.getNumberLevelField("Iob5")
    }

    public set enabledWeaponIndex(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Iob5", v)
    }

    public get healingFactor(): number[] {
        return this.getNumberLevelField("Iofr")
    }

    public set healingFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Iofr", v)
    }
}

export class AbilityDefinitionParasite extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("ANpa", id)
    }

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Poi1")
    }

    public set damagePerSecond(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Poi1", v)
    }

    public get movementSpeedFactor(): number[] {
        return this.getNumberLevelField("Poi2")
    }

    public set movementSpeedFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Poi2", v)
    }

    public get attackSpeedFactor(): number[] {
        return this.getNumberLevelField("Poi3")
    }

    public set attackSpeedFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Poi3", v)
    }

    public get stackingType(): number[] {
        return this.getNumberLevelField("Poi3")
    }

    public set stackingType(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Poi3", v)
    }

    public get summonedUnitCount(): number[] {
        return this.getNumberLevelField("Npa5")
    }

    public set summonedUnitCount(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Npa5", v)
    }

    public get summonedUnitDuration(): number[] {
        return this.getNumberLevelField("Npa6")
    }

    public set summonedUnitDuration(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Npa6", v)
    }

    public get unitTypeId(): string[] {
        return this.getStringLevelField("ipmu")
    }

    public set unitTypeId(v: LevelFieldValueProvider<string | number>) {
        this.setStringLevelField("ipmu", (level, value) => {
            return util.id2s(AbilityDefinition.getLevelFieldValue(level, value, v))
        })
    }
}

export class AbilityDefinitionPermanentInvisibility extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Apiv", id)
    }

    public get autoAcquireAttackTargets(): boolean[] {
        return this.getBooleanLevelField("Gho1")
    }

    public set autoAcquireAttackTargets(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Gho1", v)
    }
}

export class AbilityDefinitionResurrection extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AHre", id)
    }

    public get numberOfCorpsesRaised(): number[] {
        return this.getNumberLevelField("Hre1")
    }

    public set numberOfCorpsesRaised(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hre1", v)
    }

    public get raisedUnitsAreInvulnerable(): boolean[] {
        return this.getBooleanLevelField("Hre2")
    }

    public set raisedUnitsAreInvulnerable(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Hre2", v)
    }
}

export class AbilityDefinitionPhaseShift extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Apsh", id)
    }
}

export class AbilityDefinitionSearingArrows extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AHfa", id)
    }

    public get damageBonus(): number[] {
        return this.getNumberLevelField("Hfa1")
    }

    public set damageBonus(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Hfa1", v)
    }
}

export class AbilityDefinitionSentinel extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aesn", id)
    }

    public get inFlightSightRadius(): number[] {
        return this.getNumberLevelField("Esn1")
    }

    public set inFlightSightRadius(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Esn1", v)
    }

    public get hoveringSightRadius(): number[] {
        return this.getNumberLevelField("Esn2")
    }

    public set hoveringSightRadius(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Esn2", v)
    }

    public get hoveringHeight(): number[] {
        return this.getNumberLevelField("Esn3")
    }

    public set hoveringHeight(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Esn3", v)
    }

    public get numberOfOwls(): number[] {
        return this.getNumberLevelField("Esn4")
    }

    public set numberOfOwls(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Esn4", v)
    }

    public get durationOfOwls(): number[] {
        return this.getNumberLevelField("Esn5")
    }

    public set durationOfOwls(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Esn5", v)
    }
}

export class AbilityDefinitionSleep extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AUsl", id)
    }

    public get stunDuration(): number[] {
        return this.getNumberLevelField("Usl1")
    }

    public set stunDuration(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Usl1", v)
    }
}

export class AbilityDefinitionSlow extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aslo", id)
    }

    public get movementSpeedReduction(): number[] {
        return this.getNumberLevelField("Slo1")
    }

    public set movementSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Slo1", v)
    }

    public get attackSpeedReduction(): number[] {
        return this.getNumberLevelField("Slo2")
    }

    public set attackSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Slo2", v)
    }

    public get alwaysAutoCast(): boolean[] {
        return this.getBooleanLevelField("Slo3")
    }

    public set alwaysAutoCast(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Slo3", v)
    }
}

export class AbilityDefinitionSlowAura extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aasl", id)
    }

    public get movementSpeedFactor(): number[] {
        return this.getNumberLevelField("Slo1")
    }

    public set movementSpeedFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Slo1", v)
    }

    public get attackSpeedFactor(): number[] {
        return this.getNumberLevelField("Slo2")
    }

    public set attackSpeedFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Slo2", v)
    }

    public get alwaysAutoCast(): boolean[] {
        return this.getBooleanLevelField("Slo3")
    }

    public set alwaysAutoCast(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Slo3", v)
    }
}

export class AbilityDefinitionSlowPoison extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aspo", id)
    }

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Spo1")
    }

    public set damagePerSecond(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Spo1", v)
    }

    public get movementSpeedFactor(): number[] {
        return this.getNumberLevelField("Spo2")
    }

    public set movementSpeedFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Spo2", v)
    }

    public get attackSpeedFactor(): number[] {
        return this.getNumberLevelField("Spo3")
    }

    public set attackSpeedFactor(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Spo3", v)
    }

    public get stackingType(): number[] {
        return this.getNumberLevelField("Spo4")
    }

    public set stackingType(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Spo4", v)
    }
}

export class AbilityDefinitionSoulBurn extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("ANso", id)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Nso1")
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nso1", v)
    }

    public get damagePeriod(): number[] {
        return this.getNumberLevelField("Nso2")
    }

    public set damagePeriod(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nso2", v)
    }

    public get damagePenalty(): number[] {
        return this.getNumberLevelField("Nso3")
    }

    public set damagePenalty(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nso3", v)
    }

    public get movementSpeedReduction(): number[] {
        return this.getNumberLevelField("Nso4")
    }

    public set movementSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nso4", v)
    }

    public get attackSpeedReduction(): number[] {
        return this.getNumberLevelField("Nso5")
    }

    public set attackSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nso5", v)
    }
}

export class AbilityDefinitionSpellBook extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Aspb", id)
    }

    public get spells(): string[][] {
        return this.getStringLevelField("spb1").map((buff) => buff.split(","))
    }

    public set spells(v: LevelFieldValueProvider<(number | string)[]>) {
        this.setStringLevelField("spb1", (level, value) => {
            return AbilityDefinition.getLevelArrayFieldValue(level, value.split(","), v)
                .map((id) => util.id2s(id))
                .join()
        })
    }

    public get sharedCooldown(): boolean[] {
        return this.getBooleanLevelField("spb2")
    }

    public set sharedCooldown(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("spb2", v)
    }

    public get minimumSpells(): number[] {
        return this.getNumberLevelField("spb3")
    }

    public set minimumSpells(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("spb3", v)
    }

    public get maximumSpells(): number[] {
        return this.getNumberLevelField("spb4")
    }

    public set maximumSpells(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("spb4", v)
    }

    public get baseOrder(): string[] {
        return this.getStringLevelField("spb5")
    }

    public set baseOrder(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("spb5", v)
    }
}

export class AbilityDefinitionSpiritTouch extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("Arpm", id)
    }

    public get manaGained(): number[] {
        return this.getNumberLevelField("Rej2")
    }

    public set manaGained(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Rej2", v)
    }

    public get minimumManaRequired(): number[] {
        return this.getNumberLevelField("Rpb4")
    }

    public set minimumManaRequired(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Rpb4", v)
    }

    public get maximumUnitsChargedToCaster(): number[] {
        return this.getNumberLevelField("Rpb5")
    }

    public set maximumUnitsChargedToCaster(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Rpb5", v)
    }

    public get maximumUnitsAffected(): number[] {
        return this.getNumberLevelField("Rpb6")
    }

    public set maximumUnitsAffected(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Rpb6", v)
    }
}

export class AbilityDefinitionStarfall extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AEsb", id)
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Esf1", v)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Esf1")
    }

    public set damageInterval(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Esf2", v)
    }

    public get damageInterval(): number[] {
        return this.getNumberLevelField("Esf2")
    }

    public set buildingReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Esf3", v)
    }

    public get buildingReduction(): number[] {
        return this.getNumberLevelField("Esf3")
    }
}

export class AbilityDefinitionStormBolt extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AHtb", id)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Htb1")
    }

    public set damage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Htb1", v)
    }
}

export class AbilityDefinitionAcidBomb extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("ANab", id)
    }

    public set movementSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nab1", v)
    }

    public get movementSpeedReduction(): number[] {
        return this.getNumberLevelField("Nab1")
    }

    public set attackSpeedReduction(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nab2", v)
    }

    public get attackSpeedReduction(): number[] {
        return this.getNumberLevelField("Nab2")
    }

    public set armorPenalty(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nab3", v)
    }

    public get armorPenalty(): number[] {
        return this.getNumberLevelField("Nab3")
    }

    public set primaryDamage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nab4", v)
    }

    public get primaryDamage(): number[] {
        return this.getNumberLevelField("Nab4")
    }

    public set secondaryDamage(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nab5", v)
    }

    public get secondaryDamage(): number[] {
        return this.getNumberLevelField("Nab5")
    }

    public set damageInterval(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Nab6", v)
    }

    public get damageInterval(): number[] {
        return this.getNumberLevelField("Nab6")
    }
}

export class AbilityDefinitionInventory extends AbilityDefinition {
    public constructor(id?: string | number) {
        super("AInv", id)
    }

    public set capacity(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("inv1", v)
    }

    public get capacity(): number[] {
        return this.getNumberLevelField("inv1")
    }
}

export namespace ChannelAbilityPreset {
    export type TargetType = "none" | "unit" | "point" | "pointunit" | "passive"
}

const targetTypes: ChannelAbilityPreset.TargetType[] = [
    "none",
    "unit",
    "point",
    "pointunit",
    "passive",
]

const targetTypeIds: Record<ChannelAbilityPreset.TargetType, number> = {
    none: 0,
    unit: 1,
    point: 2,
    pointunit: 3,
    passive: 4,
}

const factory = new OrderTypeStringIdFactory()

export class ChannelAbilityPreset
    extends AbilityDefinition
    implements Compiletime<AbilityPresetData>
{
    private readonly orders: Record<ChannelAbilityPreset.TargetType, string | undefined> = {
        none: undefined,
        unit: undefined,
        point: undefined,
        pointunit: undefined,
        passive: undefined,
    }

    public constructor(
        id?: string,
        levels = 1,
        ctor?: {
            targetType?: LevelFieldValueProvider<ChannelAbilityPreset.TargetType>
            castRange?: LevelFieldValueProvider<number>
            icon?: string
        }
    ) {
        super("ANcl", id)
        this.levels = levels
        this.followThroughTime = 0
        this.artDuration = 0
        this.visible = true
        this.disableOtherAbilities = false
        this.casterArt = ""
        this.effectArt = ""
        this.targetArt = ""
        this.buttonPositionX = 0
        this.buttonPositionY = 2
        for (const [key, value] of pairs(ctor ?? {})) {
            this[key] = value as any
        }
        this.resetBaseOrder()
    }

    public compiletime(): AbilityPresetData {
        return {
            id: util.s2id(this.id),
        }
    }

    protected resetBaseOrder(): void {
        this.baseOrder = (level) => {
            const targetType = this.targetType[level]
            const order = this.orders[targetType] ?? factory.next(targetTypeIds[targetType])
            this.orders[targetType] = order
            return order
        }
    }

    protected setOption(option: 1 | 2 | 4 | 8 | 16, v: LevelFieldValueProvider<boolean>): void {
        this.setNumberLevelField("Ncl3", (level, value) => {
            const newValue = ObjectDefinition.getLevelFieldValue(level, (value & option) != 0, v)
            return (value & ~option) | (newValue ? option : 0)
        })
    }

    protected getOption(option: 1 | 2 | 4 | 8 | 16): boolean[] {
        return this.getNumberLevelField("Ncl3").map((value) => (value & option) != 0)
    }

    public set followThroughTime(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ncl1", v)
    }

    public get followThroughTime(): number[] {
        return this.getNumberLevelField("Ncl1")
    }

    public set targetType(v: LevelFieldValueProvider<ChannelAbilityPreset.TargetType>) {
        this.setNumberLevelField("Ncl2", (level, value) => {
            return targetTypeIds[
                ObjectDefinition.getLevelFieldValue(level, targetTypes[value] ?? "passive", v)
            ]
        })
        this.resetBaseOrder()
    }

    public get targetType(): ChannelAbilityPreset.TargetType[] {
        return this.getNumberLevelField("Ncl2").map((value) => targetTypes[value] ?? "passive")
    }

    public set artDuration(v: LevelFieldValueProvider<number>) {
        this.setNumberLevelField("Ncl4", v)
    }

    public get artDuration(): number[] {
        return this.getNumberLevelField("Ncl4")
    }

    public set disableOtherAbilities(v: LevelFieldValueProvider<boolean>) {
        this.setBooleanLevelField("Ncl5", v)
    }

    public get disableOtherAbilities(): boolean[] {
        return this.getBooleanLevelField("Ncl5")
    }

    public set baseOrder(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("Ncl6", v)
    }

    public get baseOrder(): string[] {
        return this.getStringLevelField("Ncl6")
    }

    public set visible(v: LevelFieldValueProvider<boolean>) {
        this.setOption(1, v)
    }

    public get visible(): boolean[] {
        return this.getOption(1)
    }

    public set targetingImage(v: LevelFieldValueProvider<boolean>) {
        this.setOption(2, v)
    }

    public get targetingImage(): boolean[] {
        return this.getOption(2)
    }

    public set physicalSpell(v: LevelFieldValueProvider<boolean>) {
        this.setOption(4, v)
    }

    public get physicalSpell(): boolean[] {
        return this.getOption(4)
    }

    public set universalSpell(v: LevelFieldValueProvider<boolean>) {
        this.setOption(8, v)
    }

    public get universalSpell(): boolean[] {
        return this.getOption(8)
    }

    public set uniqueCast(v: LevelFieldValueProvider<boolean>) {
        this.setOption(16, v)
    }

    public get uniqueCast(): boolean[] {
        return this.getOption(16)
    }
}

export class SpellBookAbilityPreset extends AbilityDefinitionSpellBook {
    public constructor(id?: string | number) {
        super(id)
        this.minimumSpells = 11
        this.maximumSpells = 11
        this.baseOrder = factory.next(TargetingType.NONE)
    }
}

export type AbilityPresetData = {
    id: number
}

export abstract class AbilityXX {
    protected static readonly preset: AbilityPresetData

    public static get id(): number {
        const id = this.preset.id
        rawset(this, "id", id)
        return id
    }
}
