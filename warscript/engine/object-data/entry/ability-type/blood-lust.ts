import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class BloodLustAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Ablo") as AbilityTypeId

    public get attackSpeedIncreaseFactor(): number[] {
        return this.getNumberLevelField("Blo1")
    }

    public set attackSpeedIncreaseFactor(
        attackSpeedIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Blo1", attackSpeedIncreaseFactor)
    }

    public get movementSpeedIncreaseFactor(): number[] {
        return this.getNumberLevelField("Blo2")
    }

    public set movementSpeedIncreaseFactor(
        movementSpeedIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Blo2", movementSpeedIncreaseFactor)
    }

    // TODO: check. factor?
    public get scaleIncrease(): number[] {
        return this.getNumberLevelField("Blo3")
    }

    public set scaleIncrease(scaleIncrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Blo3", scaleIncrease)
    }
}
