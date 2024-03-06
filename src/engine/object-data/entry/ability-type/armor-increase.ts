import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ArmorIncreaseAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AId1") as AbilityTypeId

    public get armorIncrease(): number[] {
        return this.getNumberLevelField("Idef")
    }

    public set armorIncrease(armorIncrease: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Idef", armorIncrease)
    }
}
