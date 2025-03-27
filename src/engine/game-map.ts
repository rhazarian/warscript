import { Rect } from "../core/types/rect"
import { Region } from "../core/types/region"

export class GameMap {
    public static get worldBoundsRect(): Rect {
        const rect = Rect.of(GetWorldBounds())
        rawset(this, "worldBoundsRect", rect)
        return rect
    }

    public static get worldBoundsRegion(): Region {
        const region = Region.create(this.worldBoundsRect)
        rawset(this, "worldBoundsRegion", region)
        return region
    }
}
