import { EvasionAbilityType } from "./evasion"
import { AbilityTypeId } from "../ability-type"

/**
 * Stacking variant of evasion (AHes); same fields as AEev.
 */
export class StackableEvasionAbilityType extends EvasionAbilityType {
    public static override readonly BASE_ID = fourCC("AHes") as AbilityTypeId
}
