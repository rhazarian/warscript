import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HolyLightAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHhb") as AbilityTypeId

    public get healing(): number[] {
        return this.getNumberLevelField("Hhb1")
    }

    public set healing(healing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hhb1", healing)
    }
}
