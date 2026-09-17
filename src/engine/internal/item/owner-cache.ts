import type { Item } from "../item"
import type { Unit } from "../unit"

/** The last unit known (from item events) to carry each item; validated against the engine on read. */
export const ownerByItem = setmetatable(new LuaMap<Item, Unit>(), { __mode: "kv" })
