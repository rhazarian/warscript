import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class CrippleAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Acri") as AbilityTypeId

    public get movementSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Cri1")
    }

    public set movementSpeedDecreaseFactor(
        movementSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Cri1", movementSpeedDecreaseFactor)
    }

    public get attackSpeedDecreaseFactor(): number[] {
        return this.getNumberLevelField("Cri2")
    }

    public set attackSpeedDecreaseFactor(
        attackSpeedDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Cri2", attackSpeedDecreaseFactor)
    }

    public get damageDecreaseFactor(): number[] {
        return this.getNumberLevelField("Cri3")
    }

    public set damageDecreaseFactor(
        damageDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Cri3", damageDecreaseFactor)
    }
}
