import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HealAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Ahea") as AbilityTypeId

    public get healing(): number[] {
        return this.getNumberLevelField("Hea1")
    }

    public set healing(healing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hea1", healing)
    }
}
