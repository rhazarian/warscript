import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ManaEfficiencyAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIme") as AbilityTypeId

    /** Mana Efficiency */
    public get manaEfficiency(): number[] {
        return this.getNumberLevelField("Ime1")
    }

    public set manaEfficiency(manaEfficiency: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ime1", manaEfficiency)
    }

    /** Flat Bonus */
    public get isFlatBonus(): boolean[] {
        return this.getBooleanLevelField("Ime2")
    }

    public set isFlatBonus(isFlatBonus: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Ime2", isFlatBonus)
    }
}
