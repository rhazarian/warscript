import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class DeathCoilAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUdc") as AbilityTypeId

    public get healing(): number[] {
        return this.getNumberLevelField("Udc1")
    }

    public set healing(healing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Udc1", healing)
    }
}
