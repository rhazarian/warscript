import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class BashAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHbh") as AbilityTypeId

    public get bashPercentageProbability(): number[] {
        return this.getNumberLevelField("Hbh1")
    }

    public set bashPercentageProbability(
        bashPercentageProbability: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Hbh1", bashPercentageProbability)
    }

    public get damageFactor(): number[] {
        return this.getNumberLevelField("Hbh2")
    }

    public set damageFactor(damageFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hbh2", damageFactor)
    }

    public get damageIncrease(): number[] {
        return this.getNumberLevelField("Hbh3")
    }

    public set damageIncrease(damageIncrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hbh3", damageIncrease)
    }

    public get evasionProbability(): number[] {
        return this.getNumberLevelField("Hbh4")
    }

    public set evasionProbability(evasionProbability: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hbh4", evasionProbability)
    }

    public get shouldNeverMiss(): boolean[] {
        return this.getBooleanLevelField("Hbh5")
    }

    public set shouldNeverMiss(shouldNeverMiss: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Hbh5", shouldNeverMiss)
    }
}
