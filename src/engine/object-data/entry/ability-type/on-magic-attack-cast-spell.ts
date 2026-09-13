import { OnAttackCastSpellAbilityType } from "./on-attack-cast-spell"
import { AbilityTypeId } from "../ability-type"

export class OnMagicAttackCastSpellAbilityType extends OnAttackCastSpellAbilityType {
    public static override readonly BASE_ID = fourCC("Asas") as AbilityTypeId
}
