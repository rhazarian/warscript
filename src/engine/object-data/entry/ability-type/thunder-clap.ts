import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ThunderClapAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHtc") as AbilityTypeId

    public get damage(): number[] {
        return this.getNumberLevelField("Htc1")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Htc1", damage)
    }

    public get specificTargetDamage(): number[] {
        return this.getNumberLevelField("Htc2")
    }

    public set specificTargetDamage(
        specificTargetDamage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Htc2", specificTargetDamage)
    }

    public get movementSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Htc3")
    }

    public set movementSpeedDecreaseFactor(
        movementSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Htc3", movementSpeedDecreaseFactor)
    }

    public get attackSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Htc4")
    }

    public set attackSpeedDecreaseFactor(
        attackSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Htc4", attackSpeedDecreaseFactor)
    }

    public get maximumDamage(): number[] {
        return this.getNumberLevelField("Htc5")
    }

    public set maximumDamage(maximumDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Htc5", maximumDamage)
    }
}
