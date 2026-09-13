import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SweepingStrikeAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHsw") as AbilityTypeId

    /** Damage */
    public get damage(): number[] {
        return this.getNumberLevelField("swp1")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("swp1", damage)
    }

    /** Attack Distance */
    public get attackDistance(): number[] {
        return this.getNumberLevelField("swp2")
    }

    public set attackDistance(attackDistance: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("swp2", attackDistance)
    }

    /** Attack Angle */
    public get attackAngle(): number[] {
        return this.getNumberLevelField("swp3")
    }

    public set attackAngle(attackAngle: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("swp3", attackAngle)
    }

    /** Damage Delay */
    public get damageDelay(): number[] {
        return this.getNumberLevelField("swp4")
    }

    public set damageDelay(damageDelay: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("swp4", damageDelay)
    }

    /** Damage Strength Modifier (%) */
    public get damageStrengthModifierPercentage(): number[] {
        return this.getNumberLevelField("swp5")
    }

    public set damageStrengthModifierPercentage(
        damageStrengthModifierPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swp5", damageStrengthModifierPercentage)
    }

    /** Healing Per Target Hit */
    public get healingPerTargetHit(): number[] {
        return this.getNumberLevelField("swp6")
    }

    public set healingPerTargetHit(
        healingPerTargetHit: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swp6", healingPerTargetHit)
    }

    /** Max Target Hit */
    public get maximumTargetsHit(): number[] {
        return this.getNumberLevelField("swp7")
    }

    public set maximumTargetsHit(
        maximumTargetsHit: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swp7", maximumTargetsHit)
    }

    /** Armor Reduction */
    public get armorReduction(): number[] {
        return this.getNumberLevelField("swp8")
    }

    public set armorReduction(armorReduction: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("swp8", armorReduction)
    }

    /** Duration Armor Reduction */
    public get armorReductionDuration(): number[] {
        return this.getNumberLevelField("swpc")
    }

    public set armorReductionDuration(
        armorReductionDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swpc", armorReductionDuration)
    }

    /** Hero Duration Armor Reduction */
    public get armorReductionHeroDuration(): number[] {
        return this.getNumberLevelField("swpd")
    }

    public set armorReductionHeroDuration(
        armorReductionHeroDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swpd", armorReductionHeroDuration)
    }

    /** Attack Speed Reduction (%) */
    public get attackSpeedReductionPercentage(): number[] {
        return this.getNumberLevelField("swp9")
    }

    public set attackSpeedReductionPercentage(
        attackSpeedReductionPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swp9", attackSpeedReductionPercentage)
    }

    /** Duration Attack Speed Reduction */
    public get attackSpeedReductionDuration(): number[] {
        return this.getNumberLevelField("swpe")
    }

    public set attackSpeedReductionDuration(
        attackSpeedReductionDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swpe", attackSpeedReductionDuration)
    }

    /** Hero Duration Attack Speed Reduction */
    public get attackSpeedReductionHeroDuration(): number[] {
        return this.getNumberLevelField("swpf")
    }

    public set attackSpeedReductionHeroDuration(
        attackSpeedReductionHeroDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swpf", attackSpeedReductionHeroDuration)
    }

    /** Damage By Target Max Health (%) */
    public get damageByTargetMaximumHealthPercentage(): number[] {
        return this.getNumberLevelField("swpa")
    }

    public set damageByTargetMaximumHealthPercentage(
        damageByTargetMaximumHealthPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swpa", damageByTargetMaximumHealthPercentage)
    }

    /** Duration Damage By Target Max Health */
    public get damageByTargetMaximumHealthDuration(): number[] {
        return this.getNumberLevelField("swpg")
    }

    public set damageByTargetMaximumHealthDuration(
        damageByTargetMaximumHealthDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swpg", damageByTargetMaximumHealthDuration)
    }

    /** Hero Duration Damage By Target Max Health */
    public get damageByTargetMaximumHealthHeroDuration(): number[] {
        return this.getNumberLevelField("swph")
    }

    public set damageByTargetMaximumHealthHeroDuration(
        damageByTargetMaximumHealthHeroDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swph", damageByTargetMaximumHealthHeroDuration)
    }

    /** Cooldown Reduction On Hit */
    public get cooldownReductionOnHit(): number[] {
        return this.getNumberLevelField("swpb")
    }

    public set cooldownReductionOnHit(
        cooldownReductionOnHit: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("swpb", cooldownReductionOnHit)
    }
}
