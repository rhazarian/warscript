import { AbilityType, AbilityTypeId } from "../ability-type"

import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class RecallAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIrt") as AbilityTypeId

    public get targetCount(): number[] {
        return this.getNumberLevelField("Irec")
    }

    public set targetCount(targetCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Irec", targetCount)
    }

    public get usesClustering(): boolean[] {
        return this.getBooleanLevelField("Itp2")
    }

    public set usesClustering(usesClustering: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Itp2", usesClustering)
    }
}
