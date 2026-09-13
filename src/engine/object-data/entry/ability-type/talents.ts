import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Hero talents (ATal). Each level is a talent tier holding exactly three ability type ids.
 */
export class TalentsAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ATal") as AbilityTypeId

    /** Talent Tier Abilities */
    public get talentTierAbilityTypeIds(): AbilityTypeId[][] {
        return this.getObjectDataEntryNumericIdsLevelField("aabi")
    }

    public set talentTierAbilityTypeIds(
        talentTierAbilityTypeIds: ObjectDataEntryLevelFieldValueSupplier<AbilityTypeId[]>,
    ) {
        this.setObjectDataEntryNumericIdsLevelField("aabi", talentTierAbilityTypeIds)
    }
}
