import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HealthBonusAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIlf") as AbilityTypeId

    public get healthBonus(): number[] {
        return this.getNumberLevelField("Ilif")
    }

    public set healthBonus(healthBonus: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ilif", healthBonus)
    }
}
