import type { Unit } from "../unit"

/** @internal For use by internal systems only. */
export const damageMetadataByTarget = setmetatable(new LuaTable<Unit, unknown>(), { __mode: "k" })
