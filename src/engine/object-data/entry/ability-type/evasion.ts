import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class EvasionAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AEev") as AbilityTypeId

    public get evasionProbability(): number[] {
        return this.getNumberLevelField("Eev1")
    }

    public set evasionProbability(
        evasionProbability: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Eev1", evasionProbability)
    }
}
