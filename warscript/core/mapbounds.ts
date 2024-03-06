import { Rect } from "./types/rect"
import { Region } from "./types/region"

export const boundRect = Rect.of(GetWorldBounds())

export const boundRegion = Region.create()
boundRegion.addRect(boundRect)

export const boundMin: Readonly<Vec2> = vec2(boundRect.minX, boundRect.minY)

export const boundMax: Readonly<Vec2> = vec2(boundRect.maxX, boundRect.maxY)

export const boundCenter: Readonly<Vec2> = vec2.multiply(vec2.add(boundMin, boundMax), 0.5)

/*const context = util.contextFn("mapbounds", () => {
    //const playableMapRect = Rect.of(GetPlayableMapRect())
    const boundRect =

    //const playableMapRegion = Region.create()
    const boundRegion =
    //playableMapRegion.addRect(playableMapRect)
    boundRegion.addRect(boundRect)

    return {
        //playableMapRect: playableMapRect,
        boundRect: boundRect,
        //playableMapRegion: playableMapRegion,
        boundRegion: boundRegion,
    }
})

//export function playableMapRect(): Rect {
//    return context.playableMapRect
//}

//export function playableMapRegion(): Region {
//    return context.playableMapRegion
//}

export function boundRect(): Rect {
    return context.boundRect
}

export function boundRegion(): Region {
    return context.boundRegion
}
*/
