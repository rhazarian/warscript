import { AbilityType, AbilityTypeId } from "../ability-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class DarkSummoningAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AUds") as AbilityTypeId

    public get targetCount(): number[] {
        return this.getNumberLevelField("Uds1")
    }

    public set targetCount(targetCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Uds1", targetCount)
    }

    // TODO: casting delay (name?)

    public get usesClustering(): boolean[] {
        return this.getBooleanLevelField("Hmt3")
    }

    public set usesClustering(usesClustering: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Hmt3", usesClustering)
    }
}
