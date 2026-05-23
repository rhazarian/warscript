import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ArmorBonusAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AId1") as AbilityTypeId

    public get armorBonus(): number[] {
        return this.getNumberLevelField("Idef")
    }

    public set armorBonus(armorBonus: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Idef", armorBonus)
    }
}
