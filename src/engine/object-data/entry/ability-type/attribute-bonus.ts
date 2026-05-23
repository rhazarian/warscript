import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class AttributeBonusAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aamk") as AbilityTypeId

    public get strengthBonus(): number[] {
        return this.getNumberLevelField("Istr")
    }

    public set strengthBonus(strengthBonus: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Istr", strengthBonus)
    }

    public get agilityBonus(): number[] {
        return this.getNumberLevelField("Iagi")
    }

    public set agilityBonus(agilityBonus: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Iagi", agilityBonus)
    }

    public get intelligenceBonus(): number[] {
        return this.getNumberLevelField("Iint")
    }

    public set intelligenceBonus(
        intelligenceBonus: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Iint", intelligenceBonus)
    }
}
