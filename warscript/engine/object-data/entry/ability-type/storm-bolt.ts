import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class StormBoltAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHtb") as AbilityTypeId

    public get damage(): number[] {
        return this.getNumberLevelField("Htb1")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Htb1", damage)
    }
}
