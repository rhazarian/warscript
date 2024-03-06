import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class MovementSpeedIncreaseAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIms") as AbilityTypeId

    public get movementSpeedIncrease(): number[] {
        return this.getNumberLevelField("Imvb")
    }

    public set movementSpeedIncrease(
        movementSpeedIncrease: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Imvb", movementSpeedIncrease)
    }
}
