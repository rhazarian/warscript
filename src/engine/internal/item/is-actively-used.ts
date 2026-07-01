import { Item } from "../item"
import { IS_ACTIVELY_USED_ITEM_FIELD } from "../../standard/fields/item"

declare module "../item" {
    interface Item {
        isActivelyUsed: boolean
    }
}
Object.defineProperty(Item.prototype, "isActivelyUsed", {
    get(this: Item): boolean {
        return IS_ACTIVELY_USED_ITEM_FIELD.getValue(this)
    },
    set(this: Item, value: boolean) {
        IS_ACTIVELY_USED_ITEM_FIELD.setValue(this, value)
    },
})
