import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ReincarnationAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AOre") as AbilityTypeId

    public get reincarnationDelay(): number[] {
        return this.getNumberLevelField("Ore1")
    }

    public set reincarnationDelay(
        reincarnationDelay: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ore1", reincarnationDelay)
    }
}
