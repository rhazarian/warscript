import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class ChargeGoldAndLumberAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AAns") as AbilityTypeId

    public get goldCost(): number[] {
        return this.getNumberLevelField("Ndt1")
    }

    public set goldCost(goldCost: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ndt1", goldCost)
    }

    public get lumberCost(): number[] {
        return this.getNumberLevelField("Ndt2")
    }

    public set lumberCost(lumberCost: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ndt2", lumberCost)
    }

    public get baseOrderTypeStringId(): string[] {
        return this.getStringLevelField("Ans5")
    }

    public set baseOrderTypeStringId(
        baseOrderTypeStringId: ObjectDataEntryLevelFieldValueSupplier<string>
    ) {
        this.setStringLevelField("Ans5", baseOrderTypeStringId)
    }

    public get chargesOwningPlayer(): boolean[] {
        return this.getBooleanLevelField("Ans6")
    }

    public set chargesOwningPlayer(
        chargesOwningPlayer: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("Ans6", chargesOwningPlayer)
    }
}
