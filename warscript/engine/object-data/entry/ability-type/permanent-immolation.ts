import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class PermanentImmolationAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANpi") as AbilityTypeId

    public get damagePerInterval(): number[] {
        return this.getNumberLevelField("Eim1")
    }

    public set damagePerInterval(
        damagePerInterval: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Eim1", damagePerInterval)
    }
}
