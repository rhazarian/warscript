import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class BlinkAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AEbl") as AbilityTypeId

    public get maximumRange(): number[] {
        return this.getNumberLevelField("Ebl1")
    }

    public set maximumRange(maximumRange: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ebl1", maximumRange)
    }

    public get minimumRange(): number[] {
        return this.getNumberLevelField("Ebl2")
    }

    public set minimumRange(minimumRange: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ebl2", minimumRange)
    }
}
