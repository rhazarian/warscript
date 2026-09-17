const getItemTypeId = GetItemTypeId

/**
 * Items that are temporarily excluded from item events (e.g. while an internal system juggles them).
 *
 * @internal For use by internal systems only.
 */
export const ignoreEventsItems = new LuaSet<jitem>()

/**
 * Item types that are always excluded from item events (technical items such as slot fillers).
 *
 * @internal For use by internal systems only.
 */
export const ignoreEventsItemTypeIds = new LuaSet<number>()

/** @internal For use by internal systems only. */
export const isItemIgnoredInEvents = (item: jitem | undefined): boolean =>
    item !== undefined &&
    (ignoreEventsItems.has(item) || ignoreEventsItemTypeIds.has(getItemTypeId(item)))
