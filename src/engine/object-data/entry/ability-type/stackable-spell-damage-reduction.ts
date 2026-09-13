import { SpellDamageReductionAbilityType } from "./spell-damage-reduction"
import { AbilityTypeId } from "../ability-type"

/**
 * Stacking variant of spell damage reduction (AIss); same fields as AIsr.
 */
export class StackableSpellDamageReductionAbilityType extends SpellDamageReductionAbilityType {
    public static override readonly BASE_ID = fourCC("AIss") as AbilityTypeId
}
