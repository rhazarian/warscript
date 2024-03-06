import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class LightningShieldAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Alsh") as AbilityTypeId

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Lsh1")
    }

    public set damagePerSecond(damagePerSecond: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Lsh1", damagePerSecond)
    }
}
