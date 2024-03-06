import { InventoryAbilityType } from "../../object-data/entry/ability-type/inventory"

/** @internal For use by internal systems only. */
export const INVENTORY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = InventoryAbilityType.create()
    abilityType.isInternal = true
    abilityType.capacity = 6
    abilityType.dropsItemsOnDeath = false
    abilityType.canUseItems = true
    abilityType.canGetItems = true
    abilityType.canDropItems = true
    return abilityType.id
})
