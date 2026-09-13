import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class StackableHardenedSkinAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHss") as AbilityTypeId

    /** Chance to Reduce Damage (%) */
    public get damageReductionPercentageProbability(): number[] {
        return this.getNumberLevelField("Ssk1")
    }

    public set damageReductionPercentageProbability(
        damageReductionPercentageProbability: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ssk1", damageReductionPercentageProbability)
    }

    /** Minimum Damage */
    public get minimumDamage(): number[] {
        return this.getNumberLevelField("Ssk2")
    }

    public set minimumDamage(minimumDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ssk2", minimumDamage)
    }

    /** Ignored Damage */
    public get ignoredDamage(): number[] {
        return this.getNumberLevelField("Ssk3")
    }

    public set ignoredDamage(ignoredDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ssk3", ignoredDamage)
    }

    /** Include Ranged Damage */
    public get includesRangedDamage(): boolean[] {
        return this.getBooleanLevelField("Ssk4")
    }

    public set includesRangedDamage(
        includesRangedDamage: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("Ssk4", includesRangedDamage)
    }

    /** Include Melee Damage */
    public get includesMeleeDamage(): boolean[] {
        return this.getBooleanLevelField("Ssk5")
    }

    public set includesMeleeDamage(
        includesMeleeDamage: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("Ssk5", includesMeleeDamage)
    }
}
