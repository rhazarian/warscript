import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class GoldMineAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Agld") as AbilityTypeId

    public get initialGold(): number[] {
        return this.getNumberLevelField("Gld1")
    }

    public set initialGold(initialGold: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Gld1", initialGold)
    }

    public get miningDuration(): number[] {
        return this.getNumberLevelField("Gld2")
    }

    public set miningDuration(miningDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Gld2", miningDuration)
    }

    public get miningCapacity(): number[] {
        return this.getNumberLevelField("Gld3")
    }

    public set miningCapacity(miningCapacity: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Gld3", miningCapacity)
    }
}
