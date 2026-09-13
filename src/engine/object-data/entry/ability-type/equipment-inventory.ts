import { InventoryAbilityType } from "./inventory"
import { AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Hero equipment inventory (AInx). Inherits the regular inventory fields (Data A-E).
 */
export class EquipmentInventoryAbilityType extends InventoryAbilityType {
    public static override readonly BASE_ID = fourCC("AInx") as AbilityTypeId

    /** Equipment Item Capacity */
    public get equipmentItemCapacity(): number[] {
        return this.getNumberLevelField("inv6")
    }

    public set equipmentItemCapacity(
        equipmentItemCapacity: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("inv6", equipmentItemCapacity)
    }
}
