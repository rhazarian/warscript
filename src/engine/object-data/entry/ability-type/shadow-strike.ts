import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ShadowStrikeAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AEsh") as AbilityTypeId

    public get damage(): number[] {
        return this.getNumberLevelField("Esh5")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Esh5", damage)
    }

    public get damagePerInterval(): number[] {
        return this.getNumberLevelField("Esh1")
    }

    public set damagePerInterval(
        damagePerInterval: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Esh1", damagePerInterval)
    }

    public get damageInterval(): number[] {
        return this.getNumberLevelField("Esh4")
    }

    public set damageInterval(damageInterval: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Esh4", damageInterval)
    }

    public get movementSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Esh2")
    }

    public set movementSpeedDecreaseFactor(
        movementSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Esh2", movementSpeedDecreaseFactor)
    }

    public get attackSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Esh3")
    }

    public set attackSpeedDecreaseFactor(
        attackSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Esh3", attackSpeedDecreaseFactor)
    }
}
