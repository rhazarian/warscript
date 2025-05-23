import { Item } from "./item"

import { Unit } from "./unit"

declare module "./item" {
    interface Item {
        readonly owner?: Unit
    }
}

const ownerByItem = setmetatable(new LuaMap<Item, Unit>(), { __mode: "kv" })

Unit.itemPickedUpEvent.addListener((unit, item) => {
    ownerByItem.set(item, unit)
})

Unit.itemDroppedEvent.addListener((unit, item) => {
    ownerByItem.delete(item)
})

Object.defineProperty(Item.prototype, "owner", {
    get(this: Item): Unit | undefined {
        return ownerByItem.get(this)
    },
})
