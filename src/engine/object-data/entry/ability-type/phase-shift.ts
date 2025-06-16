import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class PhaseShiftAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Apsh") as AbilityTypeId

    public get movementSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Hbn1")
    }

    public set movementSpeedDecreaseFactor(
        movementSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Hbn1", movementSpeedDecreaseFactor)
    }

    public get attackSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Hbn2")
    }

    public set attackSpeedDecreaseFactor(
        attackSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Hbn2", attackSpeedDecreaseFactor)
    }
}
