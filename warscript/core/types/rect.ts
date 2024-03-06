import { Handle, HandleDestructor } from "./handle"

const createRect = _G.Rect
const removeRect = RemoveRect
const getMinX = GetRectMinX
const getMinY = GetRectMinY
const getMaxX = GetRectMaxX
const getMaxY = GetRectMaxY
const getCenterX = GetRectCenterX
const getCenterY = GetRectCenterY
const setRect = SetRect

declare const rectUniqueSymbol: unique symbol

export interface ReadonlyRect {
    readonly [rectUniqueSymbol]: typeof rectUniqueSymbol

    readonly handle: jrect
    readonly minX: number
    readonly minY: number
    readonly maxX: number
    readonly maxY: number
    readonly centerX: number
    readonly centerY: number
    readonly width: number
    readonly height: number

    contains(this: ReadonlyRect, x: number, y: number): boolean
}

export class Rect extends Handle<jrect> implements ReadonlyRect {
    declare readonly [rectUniqueSymbol]: typeof rectUniqueSymbol

    protected override onDestroy(): HandleDestructor {
        removeRect(this.handle)
        return super.onDestroy()
    }

    public get minX(): number {
        return getMinX(this.handle)
    }

    public get minY(): number {
        return getMinY(this.handle)
    }

    public get maxX(): number {
        return getMaxX(this.handle)
    }

    public get maxY(): number {
        return getMaxY(this.handle)
    }

    public get centerX(): number {
        return getCenterX(this.handle)
    }

    public get centerY(): number {
        return getCenterY(this.handle)
    }

    public get width(): number {
        const handle = this.handle
        return getMaxX(handle) - getMinX(handle)
    }

    public set width(v: number) {
        const handle = this.handle
        const centerX = getCenterX(handle)
        v /= 2
        setRect(handle, centerX - v, getMinY(handle), centerX + v, getMaxY(handle))
    }

    public get height(): number {
        const handle = this.handle
        return getMaxY(handle) - getMinY(handle)
    }

    public set height(v: number) {
        const handle = this.handle
        const centerY = getCenterY(handle)
        v /= 2
        setRect(handle, getMinX(handle), centerY - v, getMaxX(handle), centerY + v)
    }

    public update(minX: number, minY: number, maxX: number, maxY: number): void {
        setRect(this.handle, minX, minY, maxX, maxY)
    }

    anchorCenter(point: Vec2): void {
        const halfWidth = this.width / 2
        const halfHeight = this.height / 2
        this.update(
            point.x - halfWidth,
            point.y - halfHeight,
            point.x + halfWidth,
            point.y + halfWidth
        )
    }

    anchorTopLeft(point: Vec2): void {
        this.update(point.x, point.y - this.width, point.x + this.height, point.y)
    }

    anchorTopRight(point: Vec2): void {
        this.update(point.x - this.width, point.y - this.height, point.x, point.y)
    }

    anchorBottomLeft(point: Vec2): void {
        this.update(point.x, point.y - this.height, point.x + this.width, point.y)
    }

    anchorBottomRight(point: Vec2): void {
        this.update(point.x - this.width, point.y, point.x, point.y + this.height)
    }

    public contains(x: number, y: number): boolean {
        const handle = this.handle
        return (
            x > getMinX(handle) && x < getMaxX(handle) && y > getMinY(handle) && y < getMaxY(handle)
        )
    }

    public static create(minX: number, minY: number, maxX: number, maxY: number): Rect {
        return Rect.of(createRect(minX, minY, maxX, maxY))
    }
}
