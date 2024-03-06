import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class CleavingAttackAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANca") as AbilityTypeId

    public get damageFactor(): number[] {
        return this.getNumberLevelField("nca1")
    }

    public set damageFactor(damageFactor: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("nca1", damageFactor)
    }
}
