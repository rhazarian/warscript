import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class GhostVisibleAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aeth") as AbilityTypeId

    public get isImmuneToMorphEffects(): boolean[] {
        return this.getBooleanLevelField("Eth1")
    }

    public set isImmuneToMorphEffects(
        isImmuneToMorphEffects: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("Eth1", isImmuneToMorphEffects)
    }

    public get doesNotBlockBuildings(): boolean[] {
        return this.getBooleanLevelField("Eth2")
    }

    public set doesNotBlockBuildings(
        doesNotBlockBuildings: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("Eth2", doesNotBlockBuildings)
    }
}
