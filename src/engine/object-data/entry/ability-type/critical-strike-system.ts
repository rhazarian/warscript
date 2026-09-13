import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class CriticalStrikeSystemAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIxr") as AbilityTypeId

    /** Chance to Critical Strike */
    public get criticalStrikePercentageProbability(): number[] {
        return this.getNumberLevelField("Ocr1")
    }

    public set criticalStrikePercentageProbability(
        criticalStrikePercentageProbability: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ocr1", criticalStrikePercentageProbability)
    }

    /** Damage Multiplier */
    public get damageFactor(): number[] {
        return this.getNumberLevelField("Ixr2")
    }

    public set damageFactor(damageFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ixr2", damageFactor)
    }

    /** Chance to Evade */
    public get evasionProbability(): number[] {
        return this.getNumberLevelField("Ixr3")
    }

    public set evasionProbability(
        evasionProbability: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ixr3", evasionProbability)
    }

    /** Exclude Item Damage */
    public get shouldExcludeItemDamage(): boolean[] {
        return this.getBooleanLevelField("Ixr4")
    }

    public set shouldExcludeItemDamage(
        shouldExcludeItemDamage: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("Ixr4", shouldExcludeItemDamage)
    }
}
