import { AbilityType, AbilityTypeId } from "../ability-type"

/**
 * Equipment inventory interface (ASpc). Has no data fields of its own.
 */
export class EquipmentInventoryInterfaceAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ASpc") as AbilityTypeId
}
