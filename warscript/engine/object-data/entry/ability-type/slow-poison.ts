import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SlowPoisonAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aspo") as AbilityTypeId

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Spo1")
    }

    public set damagePerSecond(damagePerSecond: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Spo1", damagePerSecond)
    }

    public get movementSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Spo2")
    }

    public set movementSpeedDecreaseFactor(
        movementSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Spo2", movementSpeedDecreaseFactor)
    }

    public get attackSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Spo3")
    }

    public set attackSpeedDecreaseFactor(
        attackSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Spo3", attackSpeedDecreaseFactor)
    }

    // TODO: stacking type.
}
