import { SpikedCarapaceAbilityType } from "./spiked-carapace"
import { AbilityTypeId } from "../ability-type"

/**
 * Stacking thorn shield (AUss); same fields as spiked carapace (AUts).
 */
export class StackableThornShieldAbilityType extends SpikedCarapaceAbilityType {
    public static override readonly BASE_ID = fourCC("AUss") as AbilityTypeId
}
