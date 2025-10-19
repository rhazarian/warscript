const getLocalClientWidth = BlzGetLocalClientWidth
const getLocalClientHeight = BlzGetLocalClientHeight

/** @internal For use by internal systems only. */
export const getFrameMinXMaxX = (): LuaMultiReturn<[number, number]> => {
    const w = getLocalClientWidth()
    const h = getLocalClientHeight()
    const width4by3 = (w - (h / 600) * 800) / 2
    const pxtodpi = 0.6 / h
    const minX = -width4by3 * pxtodpi
    const maxX = minX + w * pxtodpi
    return $multi(minX, maxX)
}

/** @internal For use by internal systems only. */
export const FRAME_MIN_Y = 0

/** @internal For use by internal systems only. */
export const FRAME_MAX_Y = 0.6
