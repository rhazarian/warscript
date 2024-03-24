import { arrayOfNotNull } from "../../../utility/arrays"
import { implementReadonlyNumberIndexSupplier } from "../../../utility/reflection"
import { TupleOf } from "../../../utility/types"

import { ArmorSoundType } from "../auxiliary/armor-sound-type"
import {
    CombatClassifications,
    combatClassificationsToStringArray,
    stringArrayToCombatClassifications,
} from "../auxiliary/combat-classification"
import { MovementType } from "../auxiliary/movement-type"
import { Race } from "../auxiliary/race"
import { SoundSetName } from "../auxiliary/sound-set-name"
import {
    stringArrayToUnitClassifications,
    UnitClassifications,
    unitClassificationsToStringArray,
} from "../auxiliary/unit-classification"
import { WeaponSoundType } from "../auxiliary/weapon-sound-type"
import { ObjectDataEntry, ObjectDataEntryConstructor, ObjectDataEntryId } from "../entry"
import { ObjectDataEntryIdGenerator } from "../utility/object-data-entry-id-generator"

import type { AbilityTypeId } from "./ability-type"
import type { UpgradeId } from "./upgrade"
import { AnimationQualifier } from "../auxiliary/animation-qualifier"
import { AttackType } from "../auxiliary/attack-type"

export type UnitTypeId = ObjectDataEntryId & { readonly __unitTypeId: unique symbol }

export type StandardUnitTypeId = UnitTypeId & { readonly __standardUnitTypeId: unique symbol }

let getOrCreateUnitTypeWeapons: (unitType: UnitType) => TupleOf<UnitTypeWeapon, 2>

export class UnitTypeWeapon {
    private constructor(private readonly unitType: UnitType, private readonly index: 1 | 2) {}

    public get attackType(): AttackType {
        return this.unitType["getStringField"](`ua${this.index}t`) as AttackType
    }

    public set attackType(attackType: AttackType) {
        this.unitType["setStringField"](`ua${this.index}t`, attackType)
    }

    public get backSwingDuration(): number {
        return this.unitType["getNumberField"](`ubs${this.index}`)
    }

    public set backSwingDuration(backSwingDuration: number) {
        this.unitType["setNumberField"](`ubs${this.index}`, backSwingDuration)
    }

    public get cooldown(): number {
        return this.unitType["getNumberField"](`ua${this.index}c`)
    }

    public set cooldown(cooldown: number) {
        this.unitType["setNumberField"](`ua${this.index}c`, cooldown)
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

    public get damageBase(): number {
        return this.unitType["getNumberField"](`ua${this.index}b`)
    }

    public set damageBase(damageBase: number) {
        this.unitType["setNumberField"](`ua${this.index}b`, damageBase)
    }

    public get damageDiceCount(): number {
        return this.unitType["getNumberField"](`ua${this.index}d`)
    }

    public set damageDiceCount(damageDiceNumber: number) {
        this.unitType["setNumberField"](`ua${this.index}d`, damageDiceNumber)
    }

    public get damageDiceSideCount(): number {
        return this.unitType["getNumberField"](`ua${this.index}s`)
    }

    public set damageDiceSideCount(damageDiceSideCount: number) {
        this.unitType["setNumberField"](`ua${this.index}s`, damageDiceSideCount)
    }

    public get impactDelay(): number {
        return this.unitType["getNumberField"](`udp${this.index}`)
    }

    public set impactDelay(impactDelay: number) {
        this.unitType["setNumberField"](`udp${this.index}`, impactDelay)
    }

    public get missileModelPath(): string {
        return this.unitType["getStringField"](`ua${this.index}m`)
    }

    public set missileModelPath(missileModelPath: string) {
        this.unitType["setStringField"](`ua${this.index}m`, missileModelPath)
    }

    public get range(): number {
        return this.unitType["getNumberField"](`ua${this.index}r`)
    }

    public set range(range: number) {
        this.unitType["setNumberField"](`ua${this.index}r`, range)
    }

    public get soundType(): WeaponSoundType {
        return this.unitType["getStringField"](`ucs${this.index}`) as WeaponSoundType
    }

    public set soundType(soundType: WeaponSoundType) {
        this.unitType["setStringField"](`ucs${this.index}`, soundType)
    }

    public get soundTypeSD(): WeaponSoundType {
        return this.unitType["getStringField"](`ucs${this.index}:sd`) as WeaponSoundType
    }

    public set soundTypeSD(soundTypeSD: WeaponSoundType) {
        this.unitType["setStringField"](`ucs${this.index}:sd`, soundTypeSD)
    }

    public get soundTypeHD(): WeaponSoundType {
        return this.unitType["getStringField"](`ucs${this.index}:hd`) as WeaponSoundType
    }

    public set soundTypeHD(soundTypeHD: WeaponSoundType) {
        this.unitType["setStringField"](`ucs${this.index}:hd`, soundTypeHD)
    }

    static {
        const unitTypeWeaponsByUnitTypeId = new LuaMap<UnitTypeId, TupleOf<UnitTypeWeapon, 2>>()

        getOrCreateUnitTypeWeapons = (unitType) => {
            let unitTypeWeapons = unitTypeWeaponsByUnitTypeId.get(unitType.id)
            if (unitTypeWeapons == undefined) {
                unitTypeWeapons = [new UnitTypeWeapon(unitType, 1), new UnitTypeWeapon(unitType, 2)]
                unitTypeWeaponsByUnitTypeId.set(unitType.id, unitTypeWeapons)
            }
            return unitTypeWeapons
        }
    }
}

export abstract class UnitType<Id extends UnitTypeId = UnitTypeId> extends ObjectDataEntry<Id> {
    static readonly [id: StandardUnitTypeId]: ObjectDataEntryConstructor<UnitType>

    protected static readonly idGenerator = new ObjectDataEntryIdGenerator(fourCC("x000"))

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.unit
    }

    // Abilities

    public get abilityTypeIds(): AbilityTypeId[] {
        return this.getObjectDataEntryIdsField("uabi")
    }

    public set abilityTypeIds(abilityTypeIds: AbilityTypeId[]) {
        this.setObjectDataEntryIdsField("uabi", abilityTypeIds)
    }

    public get defaultActiveAbilityTypeId(): AbilityTypeId | undefined {
        return this.getObjectDataEntryIdsField<AbilityTypeId>("udaa")[0]
    }

    public set defaultActiveAbilityTypeId(abilityTypeId: AbilityTypeId | undefined) {
        this.setObjectDataEntryIdsField("udaa", arrayOfNotNull(abilityTypeId))
    }

    // Art

    public get abilityBackSwingDuration(): number {
        return this.getNumberField("ucbs")
    }

    public set abilityBackSwingDuration(abilityBackSwingDuration: number) {
        this.setNumberField("ucbs", abilityBackSwingDuration)
    }

    public get abilityImpactDelay(): number {
        return this.getNumberField("ucpt")
    }

    public set abilityImpactDelay(castImpactDelay: number) {
        this.setNumberField("ucpt", castImpactDelay)
    }

    public get animationQualifiers(): AnimationQualifier[] {
        return this.getStringsField("uani") as AnimationQualifier[]
    }

    public set animationQualifiers(animationQualifiers: AnimationQualifier[]) {
        this.setStringsField("uani", animationQualifiers)
    }

    public get buttonPositionX(): number {
        return this.getNumberField("ubpx")
    }

    public set buttonPositionX(buttonPositionX: number) {
        this.setNumberField("ubpx", buttonPositionX)
    }

    public get buttonPositionY(): number {
        return this.getNumberField("ubpy")
    }

    public set buttonPositionY(buttonPositionY: number) {
        this.setNumberField("ubpy", buttonPositionY)
    }

    public get casterUpgradeIconPath(): string {
        return this.getStringField("ucua")
    }

    public set casterUpgradeIconPath(casterUpgradeIconPath: string) {
        this.setStringField("ucua", casterUpgradeIconPath)
    }

    public get deathDuration(): number {
        return this.getNumberField("udtm")
    }

    public set deathDuration(deathDuration: number) {
        this.setNumberField("udtm", deathDuration)
    }

    public get iconPath(): string {
        return this.getStringField("uico")
    }

    public set iconPath(iconPath: string) {
        this.setStringField("uico", iconPath)
    }

    public get iconPathSD(): string {
        return this.getStringField("uico:sd")
    }

    public set iconPathSD(iconPathSD: string) {
        this.setStringField("uico:sd", iconPathSD)
    }

    public get iconPathHD(): string {
        return this.getStringField("uico:hd")
    }

    public set iconPathHD(iconPathHD: string) {
        this.setStringField("uico:hd", iconPathHD)
    }

    public get isMissileScalingEnabled(): boolean {
        return this.getBooleanField("uscb")
    }

    public set isMissileScalingEnabled(isMissileScalingEnabled: boolean) {
        this.setBooleanField("uscb", isMissileScalingEnabled)
    }

    public get maximumPitchAngleDegrees(): number {
        return this.getNumberField("umxp")
    }

    public set maximumPitchAngleDegrees(maximumPitchAngleDegrees: number) {
        this.setNumberField("umxp", maximumPitchAngleDegrees)
    }

    public get maximumRollAngleDegrees(): number {
        return this.getNumberField("umxr")
    }

    public set maximumRollAngleDegrees(maximumRollAngleDegrees: number) {
        this.setNumberField("umxr", maximumRollAngleDegrees)
    }

    public get missileLaunchOffsetX(): number {
        return this.getNumberField("ulpx")
    }

    public set missileLaunchOffsetX(missileLaunchOffsetX: number) {
        this.setNumberField("ulpx", missileLaunchOffsetX)
    }

    public get missileLaunchOffsetY(): number {
        return this.getNumberField("ulpy")
    }

    public set missileLaunchOffsetY(missileLaunchOffsetY: number) {
        this.setNumberField("ulpy", missileLaunchOffsetY)
    }

    public get missileLaunchOffsetZ(): number {
        return this.getNumberField("ulpz")
    }

    public set missileLaunchOffsetZ(missileLaunchOffsetZ: number) {
        this.setNumberField("ulpz", missileLaunchOffsetZ)
    }

    public get missileLaunchOffsetZSD(): number {
        return this.getNumberField("ulpz:sd")
    }

    public set missileLaunchOffsetZSD(missileLaunchOffsetZSD: number) {
        this.setNumberField("ulpz:sd", missileLaunchOffsetZSD)
    }

    public get missileLaunchOffsetZHD(): number {
        return this.getNumberField("ulpz:hd")
    }

    public set missileLaunchOffsetZHD(missileLaunchOffsetZHD: number) {
        this.setNumberField("ulpz:hd", missileLaunchOffsetZHD)
    }

    public get missileLaunchSwimmingOffsetZ(): number {
        return this.getNumberField("ulsz")
    }

    public set missileLaunchSwimmingOffsetZ(missileLaunchOffsetZ: number) {
        this.setNumberField("ulsz", missileLaunchOffsetZ)
    }

    public get missileLaunchSwimmingOffsetZSD(): number {
        return this.getNumberField("ulsz:sd")
    }

    public set missileLaunchSwimmingOffsetZSD(missileLaunchSwimmingOffsetZSD: number) {
        this.setNumberField("ulsz:sd", missileLaunchSwimmingOffsetZSD)
    }

    public get missileLaunchSwimmingOffsetZHD(): number {
        return this.getNumberField("ulsz:hd")
    }

    public set missileLaunchSwimmingOffsetZHD(missileLaunchSwimmingOffsetZHD: number) {
        this.setNumberField("ulsz:hd", missileLaunchSwimmingOffsetZHD)
    }

    public get missileLaunchVisualOffsetX(): number {
        return this.getNumberField("projectileVisOffsetX")
    }

    public set missileLaunchVisualOffsetX(missileLaunchVisualOffsetX: number) {
        this.setNumberField("projectileVisOffsetX", missileLaunchVisualOffsetX)
    }

    public get missileLaunchVisualOffsetXSD(): number {
        return this.getNumberField("projectileVisOffsetX:sd")
    }

    public set missileLaunchVisualOffsetXSD(missileLaunchVisualOffsetXSD: number) {
        this.setNumberField("projectileVisOffsetX:sd", missileLaunchVisualOffsetXSD)
    }

    public get missileLaunchVisualOffsetXHD(): number {
        return this.getNumberField("projectileVisOffsetX:hd")
    }

    public set missileLaunchVisualOffsetXHD(missileLaunchVisualOffsetXHD: number) {
        this.setNumberField("projectileVisOffsetX:hd", missileLaunchVisualOffsetXHD)
    }

    public get missileLaunchVisualOffsetY(): number {
        return this.getNumberField("projectileVisOffsetY")
    }

    public set missileLaunchVisualOffsetY(missileLaunchVisualOffsetY: number) {
        this.setNumberField("projectileVisOffsetY", missileLaunchVisualOffsetY)
    }

    public get missileLaunchVisualOffsetYSD(): number {
        return this.getNumberField("projectileVisOffsetY:sd")
    }

    public set missileLaunchVisualOffsetYSD(missileLaunchVisualOffsetYSD: number) {
        this.setNumberField("projectileVisOffsetY:sd", missileLaunchVisualOffsetYSD)
    }

    public get missileLaunchVisualOffsetYHD(): number {
        return this.getNumberField("projectileVisOffsetY:hd")
    }

    public set missileLaunchVisualOffsetYHD(missileLaunchVisualOffsetYHD: number) {
        this.setNumberField("projectileVisOffsetY:hd", missileLaunchVisualOffsetYHD)
    }

    public get missileImpactOffsetZ(): number {
        return this.getNumberField("uimz")
    }

    public set missileImpactOffsetZ(missileImpactOffsetZ: number) {
        this.setNumberField("uimz", missileImpactOffsetZ)
    }

    public get missileImpactOffsetZSD(): number {
        return this.getNumberField("uimz:sd")
    }

    public set missileImpactOffsetZSD(missileImpactOffsetZSD: number) {
        this.setNumberField("uimz:sd", missileImpactOffsetZSD)
    }

    public get missileImpactOffsetZHD(): number {
        return this.getNumberField("uimz:hd")
    }

    public set missileImpactOffsetZHD(missileImpactOffsetZHD: number) {
        this.setNumberField("uimz:hd", missileImpactOffsetZHD)
    }

    public get missileImpactSwimmingOffsetZ(): number {
        return this.getNumberField("uisz")
    }

    public set missileImpactSwimmingOffsetZ(missileImpactSwimmingOffsetZ: number) {
        this.setNumberField("uisz", missileImpactSwimmingOffsetZ)
    }

    public get missileImpactSwimmingOffsetZSD(): number {
        return this.getNumberField("uisz:sd")
    }

    public set missileImpactSwimmingOffsetZSD(missileImpactSwimmingOffsetZSD: number) {
        this.setNumberField("uisz:sd", missileImpactSwimmingOffsetZSD)
    }

    public get missileImpactSwimmingOffsetZHD(): number {
        return this.getNumberField("uisz:hd")
    }

    public set missileImpactSwimmingOffsetZHD(missileImpactSwimmingOffsetZHD: number) {
        this.setNumberField("uisz:hd", missileImpactSwimmingOffsetZHD)
    }

    public get modelPath(): string {
        return this.getStringField("umdl")
    }

    public set modelPath(modelPath: string) {
        this.setStringField("umdl", modelPath)
    }

    public get modelPathSD(): string {
        return this.getStringField("umdl:sd")
    }

    public set modelPathSD(modelPathSD: string) {
        this.setStringField("umdl:sd", modelPathSD)
    }

    public get modelPathHD(): string {
        return this.getStringField("umdl:hd")
    }

    public set modelPathHD(modelPathHD: string) {
        this.setStringField("umdl:hd", modelPathHD)
    }

    public get runSpeed(): number {
        return this.getNumberField("urun")
    }

    public set runSpeed(runSpeed: number) {
        this.setNumberField("urun", runSpeed)
    }

    public get runSpeedSD(): number {
        return this.getNumberField("urun:sd")
    }

    public set runSpeedSD(runSpeedSD: number) {
        this.setNumberField("urun:sd", runSpeedSD)
    }

    public get runSpeedHD(): number {
        return this.getNumberField("urun:hd")
    }

    public set runSpeedHD(runSpeedHD: number) {
        this.setNumberField("urun:hd", runSpeedHD)
    }

    public get selectionCircleScale(): number {
        return this.getNumberField("ussc")
    }

    public set selectionCircleScale(selectionCircleScale: number) {
        this.setNumberField("ussc", selectionCircleScale)
    }

    public get selectionCircleScaleSD(): number {
        return this.getNumberField("ussc:sd")
    }

    public set selectionCircleScaleSD(selectionCircleScaleSD: number) {
        this.setNumberField("ussc:sd", selectionCircleScaleSD)
    }

    public get selectionCircleScaleHD(): number {
        return this.getNumberField("ussc:hd")
    }

    public set selectionCircleScaleHD(selectionCircleScaleHD: number) {
        this.setNumberField("ussc:hd", selectionCircleScaleHD)
    }

    public get scale(): number {
        return this.getNumberField("usca")
    }

    public set scale(scale: number) {
        this.setNumberField("usca", scale)
    }

    public get scaleSD(): number {
        return this.getNumberField("usca:sd")
    }

    public set scaleSD(scaleSD: number) {
        this.setNumberField("usca:sd", scaleSD)
    }

    public get scaleHD(): number {
        return this.getNumberField("usca:hd")
    }

    public set scaleHD(scaleHD: number) {
        this.setNumberField("usca:hd", scaleHD)
    }

    public get scoreScreenIconPath(): string {
        return this.getStringField("ussi")
    }

    public set scoreScreenIconPath(scoreScreenIconPath: string) {
        this.setStringField("ussi", scoreScreenIconPath)
    }

    public get scoreScreenIconPathSD(): string {
        return this.getStringField("ussi:sd")
    }

    public set scoreScreenIconPathSD(scoreScreenIconPathSD: string) {
        this.setStringField("ussi:sd", scoreScreenIconPathSD)
    }

    public get scoreScreenIconPathHD(): string {
        return this.getStringField("ussi:hd")
    }

    public set scoreScreenIconPathHD(scoreScreenIconPathHD: string) {
        this.setStringField("ussi:hd", scoreScreenIconPathHD)
    }

    public get specialEffectModelPath(): string {
        return this.getStringField("uspa")
    }

    public set specialEffectModelPath(specialEffectModelPath: string) {
        this.setStringField("uspa", specialEffectModelPath)
    }

    public get specialEffectModelPathSD(): string {
        return this.getStringField("uspa:sd")
    }

    public set specialEffectModelPathSD(specialEffectModelPathSD: string) {
        this.setStringField("uspa:sd", specialEffectModelPathSD)
    }

    public get specialEffectModelPathHD(): string {
        return this.getStringField("uspa:hd")
    }

    public set specialEffectModelPathHD(specialEffectModelPathHD: string) {
        this.setStringField("uspa:hd", specialEffectModelPathHD)
    }

    public get shadowImageHeight(): number {
        return this.getNumberField("ushh")
    }

    public set shadowImageHeight(shadowImageHeight: number) {
        this.setNumberField("ushh", shadowImageHeight)
    }

    public get shadowImageWidth(): number {
        return this.getNumberField("ushw")
    }

    public set shadowImageWidth(shadowImageWidth: number) {
        this.setNumberField("ushw", shadowImageWidth)
    }

    public get shadowImageXOffset(): number {
        return this.getNumberField("ushx")
    }

    public set shadowImageXOffset(shadowImageXOffset: number) {
        this.setNumberField("ushx", shadowImageXOffset)
    }

    public get shadowImageYOffset(): number {
        return this.getNumberField("ushy")
    }

    public set shadowImageYOffset(shadowImageYOffset: number) {
        this.setNumberField("ushy", shadowImageYOffset)
    }

    public get walkSpeed(): number {
        return this.getNumberField("uwal")
    }

    public set walkSpeed(walkSpeed: number) {
        this.setNumberField("uwal", walkSpeed)
    }

    public get walkSpeedSD(): number {
        return this.getNumberField("uwal:sd")
    }

    public set walkSpeedSD(walkSpeedSD: number) {
        this.setNumberField("uwal:sd", walkSpeedSD)
    }

    public get walkSpeedHD(): number {
        return this.getNumberField("uwal:hd")
    }

    public set walkSpeedHD(walkSpeedHD: number) {
        this.setNumberField("uwal:hd", walkSpeedHD)
    }

    // Combat

    public get armorSoundType(): ArmorSoundType {
        return this.getStringField("uarm") as ArmorSoundType
    }

    public set armorSoundType(armorSoundType: ArmorSoundType) {
        this.setStringField("uarm", armorSoundType)
    }

    public get armorSoundTypeSD(): ArmorSoundType {
        return this.getStringField("uarm:sd") as ArmorSoundType
    }

    public set armorSoundTypeSD(armorSoundTypeSD: ArmorSoundType) {
        this.setStringField("uarm:sd", armorSoundTypeSD)
    }

    public get armorSoundTypeHD(): ArmorSoundType {
        return this.getStringField("uarm:hd") as ArmorSoundType
    }

    public set armorSoundTypeHD(armorSoundTypeHD: ArmorSoundType) {
        this.setStringField("uarm:hd", armorSoundTypeHD)
    }

    public get combatClassifications(): CombatClassifications {
        return stringArrayToCombatClassifications(this.getStringsField("utar"))
    }

    public set combatClassifications(combatClassifications: CombatClassifications) {
        this.setStringsField("utar", combatClassificationsToStringArray(combatClassifications))
    }

    public get unitClassifications(): UnitClassifications {
        return stringArrayToUnitClassifications(this.getStringsField("utyp"))
    }

    public set unitClassifications(unitClassifications: UnitClassifications) {
        this.setStringsField("utyp", unitClassificationsToStringArray(unitClassifications))
    }

    public get weapons(): TupleOf<UnitTypeWeapon, 2> {
        return getOrCreateUnitTypeWeapons(this)
    }

    public get firstWeapon(): UnitTypeWeapon {
        return this.weapons[0]
    }

    public get secondWeapon(): UnitTypeWeapon {
        return this.weapons[1]
    }

    // Movement

    public get flyHeight(): number {
        return this.getNumberField("umvh")
    }

    public set flyHeight(flyHeight: number) {
        this.setNumberField("umvh", flyHeight)
    }

    public get flyHeightMinimum(): number {
        return this.getNumberField("umvf")
    }

    public set flyHeightMinimum(flyHeightMinimum: number) {
        this.setNumberField("umvf", flyHeightMinimum)
    }

    public get movementSpeed(): number {
        return this.getNumberField("umvs")
    }

    public set movementSpeed(movementSpeed: number) {
        this.setNumberField("umvs", movementSpeed)
    }

    public get movementSpeedMaximum(): number {
        return this.getNumberField("umas")
    }

    public set movementSpeedMaximum(movementSpeedMaximum: number) {
        this.setNumberField("umas", movementSpeedMaximum)
    }

    public get movementSpeedMinimum(): number {
        return this.getNumberField("umis")
    }

    public set movementSpeedMinimum(movementSpeedMinimum: number) {
        this.setNumberField("umis", movementSpeedMinimum)
    }

    public get movementType(): MovementType {
        return this.getStringField("umvt") as MovementType
    }

    public set movementType(movementType: MovementType) {
        this.setStringField("umvt", movementType)
    }

    // Pathing

    public get collisionSize(): number {
        return this.getNumberField("ucol")
    }

    public set collisionSize(collisionSize: number) {
        this.setNumberField("ucol", collisionSize)
    }

    public get pathingTexturePath(): string {
        return this.getStringField("upat")
    }

    public set pathingTexturePath(pathingTexturePath: string) {
        this.setStringField("upat", pathingTexturePath)
    }

    // Sound

    public get soundSetName(): SoundSetName {
        return this.getStringField("usnd") as SoundSetName
    }

    public set soundSetName(soundSetName: SoundSetName) {
        this.setStringField("usnd", soundSetName)
    }

    // Stats

    public get buildingDuration(): number {
        return this.getNumberField("ubld")
    }

    public set buildingDuration(buildingDuration: number) {
        this.setNumberField("ubld", buildingDuration)
    }

    public get foodCost(): number {
        return this.getNumberField("ufoo")
    }

    public set foodCost(foodCost: number) {
        this.setNumberField("ufoo", foodCost)
    }

    public get foodProduced(): number {
        return this.getNumberField("ufma")
    }

    public set foodProduced(foodProduced: number) {
        this.setNumberField("ufma", foodProduced)
    }

    public get formationRank(): number {
        return this.getNumberField("ufor")
    }

    public set formationRank(formationRank: number) {
        this.setNumberField("ufor", formationRank)
    }

    public get goldCost(): number {
        return this.getNumberField("ugol")
    }

    public set goldCost(goldCost: number) {
        this.setNumberField("ugol", goldCost)
    }

    public get healthRegenerationRate(): number {
        return this.getNumberField("uhpr")
    }

    public set healthRegenerationRate(healthRegenerationRate: number) {
        this.setNumberField("uhpr", healthRegenerationRate)
    }

    public get manaRegenerationRate(): number {
        return this.getNumberField("umpr")
    }

    public set manaRegenerationRate(manaRegenerationRate: number) {
        this.setNumberField("umpr", manaRegenerationRate)
    }

    public get maximumHealth(): number {
        return this.getNumberField("uhpm")
    }

    public set maximumHealth(maximumHealth: number) {
        this.setNumberField("uhpm", maximumHealth)
    }

    public get maximumMana(): number {
        return this.getNumberField("umpm")
    }

    public set maximumMana(maximumMana: number) {
        this.setNumberField("umpm", maximumMana)
    }

    public get initialMana(): number {
        return this.getNumberField("umpi")
    }

    public set initialMana(initialMana: number) {
        this.setNumberField("umpi", initialMana)
    }

    public get isStructure(): boolean {
        return this.getBooleanField("ubgd")
    }

    public set isStructure(isStructure: boolean) {
        this.setBooleanField("ubgd", isStructure)
    }

    public get race(): Race {
        return this.getStringField("urac") as Race
    }

    public set race(race: Race) {
        this.setStringField("urac", race)
    }

    // Tech Tree

    public get affectingUpgradeIds(): UpgradeId[] {
        return this.getObjectDataEntryIdsField("upgr")
    }

    public set affectingUpgradeIds(affectingUpgradeIds: UpgradeId[]) {
        this.setObjectDataEntryIdsField("upgr", affectingUpgradeIds)
    }

    // Text

    public get description(): string {
        return this.getStringField("ides")
    }

    public set description(description: string) {
        this.setStringField("ides", description)
    }

    public get name(): string {
        return this.getStringField("unam")
    }

    public set name(name: string) {
        this.setStringField("unam", name)
    }

    public get tooltipText(): string {
        return this.getStringField("utip")
    }

    public set tooltipText(tooltipText: string) {
        this.setStringField("utip", tooltipText)
    }

    public get tooltipExtendedText(): string {
        return this.getStringField("utub")
    }

    public set tooltipExtendedText(tooltipExtendedText: string) {
        this.setStringField("utub", tooltipExtendedText)
    }
}
implementReadonlyNumberIndexSupplier(UnitType, (id) => {
    return class extends UnitType {
        public static override readonly BASE_ID = id
    }
})

export type HeroUnitTypeId = UnitTypeId & {
    readonly __heroUnitTypeId: unique symbol
}

export type StandardHeroUnitTypeId = StandardUnitTypeId & HeroUnitTypeId

export abstract class HeroUnitType<
    Id extends HeroUnitTypeId = HeroUnitTypeId
> extends UnitType<Id> {
    static readonly [id: StandardUnitTypeId]: ObjectDataEntryConstructor<HeroUnitType>

    protected static override readonly idGenerator = new ObjectDataEntryIdGenerator(fourCC("H000"))

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    // Abilities

    public get heroAbilityTypeIds(): AbilityTypeId[] {
        return this.getObjectDataEntryIdsField("uhab")
    }

    public set heroAbilityTypeIds(heroAbilityTypeIds: AbilityTypeId[]) {
        this.setObjectDataEntryIdsField("uhab", heroAbilityTypeIds)
    }

    // Text

    public get properNames(): string[] {
        return this.getStringsField("upro")
    }

    public set properNames(properNames: string | string[]) {
        if (Array.isArray(properNames)) {
            this.setStringsField("upro", properNames)
            this.setNumberField("upru", properNames.length)
        } else {
            this.setStringField("upro", properNames)
        }
    }

    public get properNameCount(): number {
        return this.getNumberField("upru")
    }

    public set properNameCount(properNameCount: number) {
        this.setNumberField("upru", properNameCount)
    }
}
implementReadonlyNumberIndexSupplier(HeroUnitType, (id) => {
    return class extends HeroUnitType {
        public static override readonly BASE_ID = id
    }
})
