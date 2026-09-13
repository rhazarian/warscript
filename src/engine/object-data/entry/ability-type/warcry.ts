import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class WarcryAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHwc") as AbilityTypeId

    /** Bonus Abilities List */
    public get bonusAbilityTypeIds(): AbilityTypeId[][] {
        return this.getObjectDataEntryNumericIdsLevelField("hwc1")
    }

    public set bonusAbilityTypeIds(
        bonusAbilityTypeIds: ObjectDataEntryLevelFieldValueSupplier<AbilityTypeId[]>,
    ) {
        this.setObjectDataEntryNumericIdsLevelField("hwc1", bonusAbilityTypeIds)
    }
}
