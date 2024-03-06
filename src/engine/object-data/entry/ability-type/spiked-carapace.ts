import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SpikedCarapaceAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUts") as AbilityTypeId

    public get returnedDamageFactor(): number[] {
        return this.getNumberLevelField("Uts1")
    }

    public set returnedDamageFactor(
        returnedDamageFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Uts1", returnedDamageFactor)
    }

    public get receivedDamageFactor(): number[] {
        return this.getNumberLevelField("Uts2")
    }

    public set receivedDamageFactor(
        receivedDamageFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Uts2", receivedDamageFactor)
    }

    public get armorIncrease(): number[] {
        return this.getNumberLevelField("Uts3")
    }

    public set armorIncrease(armorIncrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Uts3", armorIncrease)
    }
}
