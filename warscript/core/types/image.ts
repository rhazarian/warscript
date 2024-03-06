import { Handle, HandleDestructor } from "./handle"
import { Color } from "./color"

const createImage = CreateImage
const destroyImage = DestroyImage
const setImagePosition = SetImagePosition

const enum ImagePropertyKey {
    X = 100,
    Y,
    VISIBLE,
    COLOR,
}

export class Image extends Handle<jimage> {
    private [ImagePropertyKey.X]: number
    private [ImagePropertyKey.Y]: number
    private [ImagePropertyKey.VISIBLE]?: true
    private [ImagePropertyKey.COLOR]?: Color

    public constructor(handle: jimage, x: number, y: number) {
        super(handle)
        this[ImagePropertyKey.X] = x
        this[ImagePropertyKey.Y] = y
    }

    protected override onDestroy(): HandleDestructor {
        destroyImage(this.handle)
        return super.onDestroy()
    }

    public get x(): number {
        return this[ImagePropertyKey.X]
    }

    public set x(x: number) {
        setImagePosition(this.handle, x, this[ImagePropertyKey.Y], 0)
        this[ImagePropertyKey.X] = x
    }

    public get y(): number {
        return this[ImagePropertyKey.Y]
    }

    public set y(y: number) {
        setImagePosition(this.handle, this[ImagePropertyKey.X], y, 0)
        this[ImagePropertyKey.Y] = y
    }

    public getPosition(): LuaMultiReturn<[number, number]> {
        return $multi(this[ImagePropertyKey.X], this[ImagePropertyKey.Y])
    }

    public setPosition(x: number, y: number): void {
        setImagePosition(this.handle, x, y, 0)
        this[ImagePropertyKey.X] = x
        this[ImagePropertyKey.Y] = y
    }

    public get visible(): boolean {
        return this[ImagePropertyKey.VISIBLE] == true
    }

    public set visible(visible: boolean) {
        SetImageRenderAlways(this.handle, visible)
        this[ImagePropertyKey.VISIBLE] = visible ? true : undefined
    }

    public get color(): Color {
        return this[ImagePropertyKey.COLOR] ?? Color.white
    }

    public set color(color: Color) {
        SetImageColor(this.handle, color.r, color.g, color.b, color.a)
        this[ImagePropertyKey.COLOR] = color
    }

    public static create(
        path: string,
        x: number,
        y: number,
        sizeX: number,
        sizeY: number,
        layer?: 1 | 2 | 3 | 4
    ): Image {
        return Image.of(
            createImage(path, sizeX, sizeY, 0, x, y, 0, sizeX / 2, sizeY / 2, 0, layer ?? 1),
            x,
            y
        )
    }
}
