import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class BerserkAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Absk") as AbilityTypeId

    public get movementSpeedIncreaseFactor(): number[] {
        return this.getNumberLevelField("bsk1")
    }

    public set movementSpeedIncreaseFactor(
        movementSpeedIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("bsk1", movementSpeedIncreaseFactor)
    }

    public get attackSpeedIncreaseFactor(): number[] {
        return this.getNumberLevelField("bsk2")
    }

    public set attackSpeedIncreaseFactor(
        attackSpeedIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("bsk2", attackSpeedIncreaseFactor)
    }
}
