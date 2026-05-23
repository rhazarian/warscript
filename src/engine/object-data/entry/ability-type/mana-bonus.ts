import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ManaBonusAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AImb") as AbilityTypeId

    public get manaBonus(): number[] {
        return this.getNumberLevelField("Iman")
    }

    public set manaBonus(manaBonus: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Iman", manaBonus)
    }
}
