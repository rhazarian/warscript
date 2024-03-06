import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class CriticalStrikeAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AOcr") as AbilityTypeId

    public get criticalStrikePercentageProbability(): number[] {
        return this.getNumberLevelField("Ocr1")
    }

    public set criticalStrikePercentageProbability(
        criticalStrikePercentageProbability: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ocr1", criticalStrikePercentageProbability)
    }

    public get damageFactor(): number[] {
        return this.getNumberLevelField("Ocr2")
    }

    public set damageFactor(damageFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocr2", damageFactor)
    }

    public get damageIncrease(): number[] {
        return this.getNumberLevelField("Ocr3")
    }

    public set damageIncrease(damageIncrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocr3", damageIncrease)
    }

    public get evasionProbability(): number[] {
        return this.getNumberLevelField("Ocr4")
    }

    public set evasionProbability(evasionProbability: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocr4", evasionProbability)
    }

    public get shouldNeverMiss(): boolean[] {
        return this.getBooleanLevelField("Ocr5")
    }

    public set shouldNeverMiss(shouldNeverMiss: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Ocr5", shouldNeverMiss)
    }

    public get shouldExcludeItemDamage(): boolean[] {
        return this.getBooleanLevelField("Ocr6")
    }

    public set shouldExcludeItemDamage(
        shouldExcludeItemDamage: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("Ocr6", shouldExcludeItemDamage)
    }
}
