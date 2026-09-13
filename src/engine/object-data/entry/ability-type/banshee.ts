import { AbilityType, AbilityTypeId } from "../ability-type"

/**
 * Banshee (Abns). Has no data fields of its own.
 */
export class BansheeAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Abns") as AbilityTypeId
}
