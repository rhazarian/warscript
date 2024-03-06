import { Handle, HandleDestructor } from "./handle"
import { Rect } from "./rect"
import { Unit } from "../../engine/internal/unit"
import { Event, TriggerEvent } from "../../event"

class RegionEnterEvent extends TriggerEvent<[Unit]> {
    public constructor(region: Region) {
        super(
            (trigger) => TriggerRegisterEnterRegion(trigger, region.handle),
            () => $multi(Unit.of(GetEnteringUnit()))
        )
        region.destroyEvent.addListener(() => {
            this.destroy()
        })
    }
}

class RegionLeaveEvent extends TriggerEvent<[Unit]> {
    public constructor(region: Region) {
        super(
            (trigger) => TriggerRegisterLeaveRegion(trigger, region.handle),
            () => $multi(Unit.of(GetLeavingUnit()))
        )
        region.destroyEvent.addListener(() => {
            this.destroy()
        })
    }
}

export class Region extends Handle<jregion> {
    protected override onDestroy(): HandleDestructor {
        RemoveRegion(this.handle)
        return super.onDestroy()
    }

    public addRect(rect: Rect): void {
        RegionAddRect(this.handle, rect.handle)
    }

    public removeRect(rect: Rect): void {
        RegionClearRect(this.handle, rect.handle)
    }

    public contains(point: Vec2): boolean {
        return IsPointInRegion(this.handle, point.x, point.y)
    }

    public get onUnitEnter(): Event<[Unit]> {
        const event = new RegionEnterEvent(this)
        rawset(this, "onUnitEnter", event)
        return event
    }

    public get onUnitLeave(): Event<[Unit]> {
        const event = new RegionLeaveEvent(this)
        rawset(this, "onUnitLeave", event)
        return event
    }

    public static create(...rects: Rect[]): Region {
        const handle = CreateRegion()
        for (const i of $range(1, rects.length)) {
            RegionAddRect(handle, rects[i - 1].handle)
        }
        return Region.of(handle)
    }
}
