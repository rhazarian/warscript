import { BlankItemType } from "../../object-data/entry/item-type/blank"

/** @internal For use by internal systems. */
export const DUMMY_ITEM_ID = compiletime(() => {
    const itemType = BlankItemType.create()
    return itemType.id
})
