import { Player } from "../../../core/types/player"
import { dummyUnitId } from "../../../objutil/dummy"
import { findUnitItemSlot } from "../utility"

const isItemOwned = IsItemOwned
const isItemPowerup = IsItemPowerup
const getItemX = GetItemX
const getItemY = GetItemY
const setItemBooleanField = BlzSetItemBooleanField
const setItemPosition = SetItemPosition
const unitAddItem = UnitAddItem
const unitDropItemSlot = UnitDropItemSlot
const unitRemoveItem = UnitRemoveItem

const dummy = assert(CreateUnit(Player.neutralVictim.handle, dummyUnitId, 0, 0, 270))
ShowUnit(dummy, false)

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
