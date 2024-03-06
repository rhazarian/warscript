import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SlowAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aslo") as AbilityTypeId

    public get movementSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Slo1")
    }

    public set movementSpeedDecreaseFactor(
        movementSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Slo1", movementSpeedDecreaseFactor)
    }

    public get attackSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Slo2")
    }

    public set attackSpeedDecreaseFactor(
        attackSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Slo2", attackSpeedDecreaseFactor)
    }

    public get shouldAlwaysAutoCast(): boolean[] {
        return this.getBooleanLevelField("Slo3")
    }

    public set shouldAlwaysAutoCast(
        shouldAlwaysAutoCast: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("Slo3", shouldAlwaysAutoCast)
    }
}
