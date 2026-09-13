import { AbilityType, AbilityTypeId } from "../ability-type"

/**
 * Grant talent point (ATap). Data A-C exist in the SLK but have no object editor metadata.
 */
export class GrantTalentPointAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ATap") as AbilityTypeId
}
