import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class InventoryAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AInv") as AbilityTypeId

    public get capacity(): number[] {
        return this.getNumberLevelField("inv1")
    }

    public set capacity(capacity: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("inv1", capacity)
    }

    public get dropsItemsOnDeath(): boolean[] {
        return this.getBooleanLevelField("inv2")
    }

    public set dropsItemsOnDeath(
        dropsItemsOnDeath: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("inv2", dropsItemsOnDeath)
    }

    public get canUseItems(): boolean[] {
        return this.getBooleanLevelField("inv3")
    }

    public set canUseItems(canUseItems: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("inv3", canUseItems)
    }

    public get canGetItems(): boolean[] {
        return this.getBooleanLevelField("inv4")
    }

    public set canGetItems(canGetItems: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("inv4", canGetItems)
    }

    public get canDropItems(): boolean[] {
        return this.getBooleanLevelField("inv5")
    }

    public set canDropItems(canDropItems: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("inv5", canDropItems)
    }
}
