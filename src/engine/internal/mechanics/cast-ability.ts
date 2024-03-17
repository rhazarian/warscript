import { AbilityType, AbilityTypeId } from "../../object-data/entry/ability-type"
import { DUMMY_ITEM_ID } from "../object-data/dummy-item"
import { INVENTORY_DUMMY_NATIVE_UNIT } from "../misc/dummy-units"
import { checkNotNull } from "../../../utility/preconditions"
import { INVENTORY_ABILITY_TYPE_ID } from "../object-data/dummy-inventory"
import { map, toLuaSet } from "../../../utility/arrays"

const createItem = CreateItem
const getAbilityId = BlzGetAbilityId
const getItemAbility = BlzGetItemAbility
const getUnitAbilityByIndex = BlzGetUnitAbilityByIndex
const itemAddAbility = BlzItemAddAbility
const setItemBooleanField = BlzSetItemBooleanField
const removeItem = RemoveItem
const unitAddAbility = UnitAddAbility
const unitAddItem = UnitAddItem
const unitDropItemSlot = UnitDropItemSlot
const unitInventorySize = UnitInventorySize
const unitRemoveAbility = UnitRemoveAbility
const unitRemoveItemFromSlot = UnitRemoveItemFromSlot

const INVENTORY_ABILITY_TYPE_IDS = postcompile(() => {
    return toLuaSet(
        AbilityType.getAllIdsByBaseIds(map(["AInv", "Aihn", "Aien", "Aion", "Aiun"], fourCC))
    )
})

/** @internal For use by internal systems only. */
export const castAbility = <Args extends any[]>(
    nativeUnit: junit,
    abilityTypeId: AbilityTypeId,
    prepareAbility?: (nativeAbility: jability, ...args: Args) => void,
    ...args: Args
): boolean => {
    const nativeItem = createItem(DUMMY_ITEM_ID, 0, 0)
    unitAddItem(INVENTORY_DUMMY_NATIVE_UNIT, nativeItem)
    itemAddAbility(nativeItem, abilityTypeId)
    const nativeAbility = checkNotNull(getItemAbility(nativeItem, abilityTypeId))
    if (prepareAbility != undefined) {
        prepareAbility(nativeAbility, ...args)
    }
    setItemBooleanField(nativeItem, ITEM_BF_ACTIVELY_USED, true)
    setItemBooleanField(nativeItem, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, true)
    let success: boolean
    if (unitAddItem(nativeUnit, nativeItem)) {
        success = true
    } else {
        let latestInventoryAbilityTypeId = 0
        const nativeItemBySlot = new LuaMap<number, jitem>()
        const inventorySize = unitInventorySize(nativeUnit)
        if (inventorySize != 0) {
            for (const slot of $range(0, inventorySize - 1)) {
                nativeItemBySlot.set(slot, unitRemoveItemFromSlot(nativeUnit, slot))
            }
            let unitNativeAbility = getUnitAbilityByIndex(nativeUnit, 0)
            let i = 1
            while (unitNativeAbility != undefined) {
                const abilityTypeId = getAbilityId(unitNativeAbility) as AbilityTypeId
                if (INVENTORY_ABILITY_TYPE_IDS.has(abilityTypeId)) {
                    latestInventoryAbilityTypeId = abilityTypeId
                }
                unitNativeAbility = getUnitAbilityByIndex(nativeUnit, i)
                ++i
            }
            unitRemoveAbility(nativeUnit, latestInventoryAbilityTypeId)
        }
        unitAddAbility(nativeUnit, INVENTORY_ABILITY_TYPE_ID)
        success = unitAddItem(nativeUnit, nativeItem)
        unitRemoveAbility(nativeUnit, INVENTORY_ABILITY_TYPE_ID)
        if (latestInventoryAbilityTypeId != 0) {
            unitAddAbility(nativeUnit, latestInventoryAbilityTypeId)
            for (const [slot, nativeItem] of nativeItemBySlot) {
                unitAddItem(nativeUnit, nativeItem)
                unitDropItemSlot(nativeUnit, nativeItem, slot)
            }
        }
    }
    removeItem(nativeItem)
    return success
}
