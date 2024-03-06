import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HealingWaveAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AOhw") as AbilityTypeId

    public get healing(): number[] {
        return this.getNumberLevelField("Ocl1")
    }

    public set healing(healing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocl1", healing)
    }

    public get targetCount(): number[] {
        return this.getNumberLevelField("Ocl2")
    }

    public set targetCount(targetCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ocl2", targetCount)
    }

    public get healingDecreaseFactor(): number[] {
        return this.getNumberLevelField("Ocl3")
    }

    public set healingDecreaseFactor(
        healingDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Ocl3", healingDecreaseFactor)
    }
}
