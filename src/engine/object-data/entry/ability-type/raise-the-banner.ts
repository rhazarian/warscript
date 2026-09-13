import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class RaiseTheBannerAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Aaga") as AbilityTypeId

    /** Given Abilities */
    public get givenAbilityTypeIds(): AbilityTypeId[][] {
        return this.getObjectDataEntryNumericIdsLevelField("aga1")
    }

    public set givenAbilityTypeIds(
        givenAbilityTypeIds: ObjectDataEntryLevelFieldValueSupplier<AbilityTypeId[]>,
    ) {
        this.setObjectDataEntryNumericIdsLevelField("aga1", givenAbilityTypeIds)
    }
}
