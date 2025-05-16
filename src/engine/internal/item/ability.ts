import { Player } from "../../../core/types/player"
import { dummyUnitId } from "../../../objutil/dummy"
import { findUnitItemSlot } from "../utility"
import { BlankItemType } from "../../object-data/entry/item-type/blank"
import { abilityTypeIdGenerator } from "../../object-data/utility/object-data-entry-id-generator"
import type { AbilityTypeId } from "../../object-data/entry/ability-type"
import { MINIMUM_POSITIVE_NORMALIZED_FLOAT } from "../../../math"

const isItemOwned = IsItemOwned
const isItemPowerup = IsItemPowerup
const getItemX = GetItemX
const getItemY = GetItemY
const setAbilityRealLevelField = BlzSetAbilityRealLevelField
const setItemIntegerField = BlzSetItemIntegerField
const getItemIntegerField = BlzGetItemIntegerField
const setItemBooleanField = BlzSetItemBooleanField
const setItemPosition = SetItemPosition
const unitAddItem = UnitAddItem
const unitDropItemSlot = UnitDropItemSlot
const unitRemoveItem = UnitRemoveItem
const unitUseItem = UnitUseItem
const unitResetCooldown = UnitResetCooldown

const COOLDOWN_STARTER_ABILITY_TYPE_ID = compiletime(() => {
    if (!currentMap) {
        return 0 as AbilityTypeId
    }
    const abilityType = currentMap.objects.ability.newObject(
        util.id2s(abilityTypeIdGenerator.next()),
        "Absk",
    )
    abilityType["bsk1+0"] = 0
    abilityType["bsk2+0"] = 0
    abilityType["bsk3+0"] = 0
    abilityType["amcs+0"] = 0
    abilityType["adur+0"] = MINIMUM_POSITIVE_NORMALIZED_FLOAT
    abilityType["ahdu+0"] = MINIMUM_POSITIVE_NORMALIZED_FLOAT
    return util.s2id(abilityType.id) as AbilityTypeId
})

const COOLDOWN_STARTER_ITEM_TYPE_ID = compiletime(() => {
    const itemType = BlankItemType.create()
    itemType.name = "[Warscript/Dummy] Item Cooldown Starter"
    itemType.abilityTypeIds = [COOLDOWN_STARTER_ABILITY_TYPE_ID]
    itemType.cooldownGroupId = COOLDOWN_STARTER_ABILITY_TYPE_ID
    itemType.activelyUsed = true
    return itemType.id
})

const dummy = assert(CreateUnit(Player.neutralVictim.handle, dummyUnitId, 0, 0, 270))

const cooldownStarterItem = UnitAddItemById(dummy, COOLDOWN_STARTER_ITEM_TYPE_ID)

const cooldownStarterAbility = BlzGetItemAbility(
    cooldownStarterItem,
    COOLDOWN_STARTER_ABILITY_TYPE_ID,
)!

ShowUnit(dummy, false)

const startItemCooldownInternal = (handle: jitem, cooldown: number): void => {
    const cooldownGroup = getItemIntegerField(handle, ITEM_IF_COOLDOWN_GROUP)
    setItemIntegerField(handle, ITEM_IF_COOLDOWN_GROUP, COOLDOWN_STARTER_ABILITY_TYPE_ID)
    setAbilityRealLevelField(cooldownStarterAbility, ABILITY_RLF_COOLDOWN, 0, cooldown)
    unitResetCooldown(dummy)
    unitUseItem(dummy, cooldownStarterItem)
    //setItemIntegerField(handle, ITEM_IF_COOLDOWN_GROUP, cooldownGroup)
}

/** @internal For use by internal systems only. */
export const startItemCooldown = (
    handle: jitem,
    owner: junit | undefined,
    cooldown: number,
): void => {
    doAbilityActionForceDummy(handle, owner, startItemCooldownInternal, cooldown)
}

/** @internal For use by internal systems only. */
export const abilityActionDummy = dummy

/** @internal For use by internal systems only. */
export const doAbilityAction = <T, Args extends any[]>(
    handle: jitem,
    action: (handle: jitem, ...args: Args) => T,
    ...args: Args
): T => {
    const isOwned = isItemOwned(handle)
    let isPowerup: boolean | undefined
    let x: number | undefined
    let y: number | undefined
    if (!isOwned) {
        if (isItemPowerup(handle)) {
            setItemBooleanField(handle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, false)
            isPowerup = true
        }
        x = getItemX(handle)
        y = getItemY(handle)
        unitAddItem(dummy, handle)
    }

    const result = action(handle, ...args)

    if (!isOwned) {
        unitRemoveItem(dummy, handle)
        setItemPosition(handle, x!, y!)
        if (isPowerup) {
            setItemBooleanField(handle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, true)
        }
    }

    return result
}

/** @internal For use by internal systems only. */
export const doAbilityActionForceDummy = <T, Args extends any[]>(
    handle: jitem,
    owner: junit | undefined,
    action: (handle: jitem, ...args: Args) => T,
    ...args: Args
): T => {
    if (owner == undefined) {
        return doAbilityAction(handle, action, ...args)
    }
    const slot = findUnitItemSlot(owner, handle)
    if (slot == undefined) {
        return doAbilityAction(handle, action, ...args)
    }

    let isPowerup: boolean | undefined
    if (isItemPowerup(handle)) {
        setItemBooleanField(handle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, false)
        isPowerup = true
    }
    unitRemoveItem(owner, handle)
    unitAddItem(dummy, handle)

    const result = action(handle, ...args)

    unitRemoveItem(dummy, handle)
    unitAddItem(owner, handle)
    unitDropItemSlot(owner, handle, slot)
    if (isPowerup) {
        setItemBooleanField(handle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, true)
    }

    return result
}
