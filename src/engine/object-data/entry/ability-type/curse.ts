import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class CurseAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Acrs") as AbilityTypeId

    public get missProbability(): number[] {
        return this.getNumberLevelField("Crs\0")
    }

    public set missProbability(missProbability: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Crs\0", missProbability)
    }
}
