import { AbilityType, AbilityTypeId } from "../ability-type"

/**
 * Spec interface (ASpc, `CAbilitySpecInterface` in the engine). Has no data fields of its own.
 */
export class SpecInterfaceAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ASpc") as AbilityTypeId
}
