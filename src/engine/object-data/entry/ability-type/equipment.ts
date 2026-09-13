import { InventoryAbilityType } from "./inventory"
import { AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Equipment (AEqu). Data A-E carry the regular inventory fields, Data F the level threshold per level.
 */
export class EquipmentAbilityType extends InventoryAbilityType {
    public static override readonly BASE_ID = fourCC("AEqu") as AbilityTypeId

    /** Equipment Level Threshold */
    public get equipmentLevelThreshold(): number[] {
        return this.getNumberLevelField("equ1")
    }

    public set equipmentLevelThreshold(
        equipmentLevelThreshold: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("equ1", equipmentLevelThreshold)
    }
}
