import { Item } from "../item"
import {
    CAN_BE_SOLD_TO_MERCHANTS_ITEM_FIELD,
    IS_ACTIVELY_USED_ITEM_FIELD,
} from "../../standard/fields/item"

declare module "../item" {
    interface Item {
        canBeSold: boolean
    }
}
Object.defineProperty(Item.prototype, "canBeSold", {
    get(this: Item): boolean {
        return CAN_BE_SOLD_TO_MERCHANTS_ITEM_FIELD.getValue(this)
    },
    set(this: Item, value: boolean) {
        CAN_BE_SOLD_TO_MERCHANTS_ITEM_FIELD.setValue(this, value)
    },
})

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
