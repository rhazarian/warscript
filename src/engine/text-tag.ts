import { Color } from "../core/types/color"
import { Unit } from "./internal/unit"
import { Timer } from "../core/types/timer"
import { AbstractDestroyable, Destructor } from "../destroyable"
import { PLAYER_LOCAL_HANDLE } from "../core/types/player"
import { worldCoordinatesToFrame } from "../core/types/playerCamera"
import { getTerrainZ } from "./internal/misc/get-terrain-z"

const createTextTag = CreateTextTag
const destroyTextTag = DestroyTextTag
const setTextTagText = SetTextTagText
const setTextTagPos = SetTextTagPos
const setTextTagPosUnit = SetTextTagPosUnit
const setTextTagColor = SetTextTagColor
const setTextTagVelocity = SetTextTagVelocity
const setTextTagVisibility = SetTextTagVisibility
const setTextTagSuspended = SetTextTagSuspended
const setTextTagPermanent = SetTextTagPermanent
const setTextTagAge = SetTextTagAge
const setTextTagLifespan = SetTextTagLifespan
const setTextTagFadepoint = SetTextTagFadepoint
const isUnitHidden = IsUnitHidden
const isUnitLoaded = IsUnitLoaded
const isUnitVisible = IsUnitVisible
const getUnitFlyHeight = GetUnitFlyHeight
const getUnitX = GetUnitX
const getUnitY = GetUnitY

const DEFAULT_FONT_SIZE = 0.024

export type TextTagPreset = {
    fadepoint: number
    lifespan: number
    offsetX: number
    offsetY: number
    offsetZ: number
    velocityX: number
    velocityY: number
    color: Color
}

const applyConfiguration = (textTag: jtexttag, configuration: TextTagPreset): void => {
    setTextTagFadepoint(textTag, configuration.fadepoint)
    setTextTagLifespan(textTag, configuration.lifespan)
    const color = configuration.color
    setTextTagColor(textTag, color.r, color.g, color.b, color.a)
    setTextTagVelocity(textTag, configuration.velocityX, configuration.velocityY)
    setTextTagPermanent(textTag, false)
    setTextTagVisibility(textTag, true)
}

const unitTextTags = setmetatable(new LuaSet<TextTag>(), { __mode: "k" })

const enum TextTagPropertyKey {
    UNIT = 100,
    HANDLE,
    CONFIGURATION,
    TEXT,
    FONT_SIZE,
    COLOR,
    X,
    Y,
}

const ensureHandle = (textTag: TextTag): jtexttag => {
    let handle = textTag[TextTagPropertyKey.HANDLE]
    if (handle == undefined) {
        handle = createTextTag()
        applyConfiguration(handle, textTag[TextTagPropertyKey.CONFIGURATION]!)
        setTextTagPermanent(handle, true)
        setTextTagText(
            handle,
            textTag[TextTagPropertyKey.TEXT] ?? "",
            textTag[TextTagPropertyKey.FONT_SIZE] ?? DEFAULT_FONT_SIZE,
        )
        const color = textTag[TextTagPropertyKey.COLOR]
        if (color !== undefined) {
            setTextTagColor(handle, color.r, color.g, color.b, color.a)
        }
        const unit = textTag[TextTagPropertyKey.UNIT]
        if (unit !== undefined) {
            setTextTagPosUnit(
                handle,
                unit.handle,
                textTag[TextTagPropertyKey.CONFIGURATION]!.offsetZ,
            )
        } else {
            setTextTagPos(
                handle,
                textTag[TextTagPropertyKey.X] ?? 0,
                textTag[TextTagPropertyKey.Y] ?? 0,
                0,
            )
        }
        textTag[TextTagPropertyKey.HANDLE] = handle
    }
    return handle
}

export class TextTag extends AbstractDestroyable {
    private [TextTagPropertyKey.HANDLE]?: jtexttag
    private [TextTagPropertyKey.CONFIGURATION]?: Readonly<TextTagPreset>
    private [TextTagPropertyKey.TEXT]?: string
    private [TextTagPropertyKey.FONT_SIZE]?: number
    private [TextTagPropertyKey.COLOR]?: Color
    private [TextTagPropertyKey.UNIT]?: Unit
    private [TextTagPropertyKey.X]?: number
    private [TextTagPropertyKey.Y]?: number

    private constructor(handle?: jtexttag) {
        super()
        this[TextTagPropertyKey.HANDLE] = handle
    }

    protected override onDestroy(): Destructor {
        const handle = this[TextTagPropertyKey.HANDLE]
        if (handle !== undefined) {
            destroyTextTag(handle)
            this[TextTagPropertyKey.HANDLE] = undefined
        }
        unitTextTags.delete(this)
        return super.onDestroy()
    }

    public get text(): string {
        return this[TextTagPropertyKey.TEXT] ?? ""
    }

    public set text(text: string) {
        setTextTagText(
            ensureHandle(this),
            text,
            this[TextTagPropertyKey.FONT_SIZE] ?? DEFAULT_FONT_SIZE,
        )
        this[TextTagPropertyKey.TEXT] = text
    }

    public get fontSize(): number {
        return this[TextTagPropertyKey.FONT_SIZE] ?? DEFAULT_FONT_SIZE
    }

    public set fontSize(fontSize: number) {
        setTextTagText(ensureHandle(this), this[TextTagPropertyKey.TEXT] ?? "", DEFAULT_FONT_SIZE)
        this[TextTagPropertyKey.FONT_SIZE] = fontSize
    }

    public get color(): Color {
        return this[TextTagPropertyKey.COLOR] ?? Color.white
    }

    public set color(color: Color) {
        setTextTagColor(ensureHandle(this), color.r, color.g, color.b, color.a)
        this[TextTagPropertyKey.COLOR] = color
    }

    public get unit(): Unit | undefined {
        return this[TextTagPropertyKey.UNIT]
    }

    public set unit(unit: Unit | undefined) {
        if (unit !== undefined) {
            setTextTagPosUnit(ensureHandle(this), unit.handle, 0)
            this[TextTagPropertyKey.X] = undefined
            this[TextTagPropertyKey.Y] = undefined
            unitTextTags.add(this)
        } else if (this[TextTagPropertyKey.UNIT] !== undefined) {
            const unit = this[TextTagPropertyKey.UNIT]
            const x = unit.x
            const y = unit.y
            setTextTagPos(ensureHandle(this), x, y, 0)
            this[TextTagPropertyKey.X] = x
            this[TextTagPropertyKey.Y] = y
            unitTextTags.delete(this)
        }
        this[TextTagPropertyKey.UNIT] = unit
    }

    public get x(): number {
        return this[TextTagPropertyKey.X] ?? this[TextTagPropertyKey.UNIT]?.x ?? 0
    }

    public set x(x: number) {
        setTextTagPos(
            ensureHandle(this),
            x,
            this[TextTagPropertyKey.Y] ?? this[TextTagPropertyKey.UNIT]?.y ?? 0,
            0,
        )
        this[TextTagPropertyKey.X] = x
        this[TextTagPropertyKey.UNIT] = undefined
        unitTextTags.delete(this)
    }

    public get y(): number {
        return this[TextTagPropertyKey.Y] ?? this[TextTagPropertyKey.UNIT]?.y ?? 0
    }

    public set y(y: number) {
        setTextTagPos(
            ensureHandle(this),
            this[TextTagPropertyKey.X] ?? this[TextTagPropertyKey.UNIT]?.x ?? 0,
            y,
            0,
        )
        this[TextTagPropertyKey.Y] = y
        this[TextTagPropertyKey.UNIT] = undefined
        unitTextTags.delete(this)
    }

    public static BASE: Readonly<TextTagPreset> = {
        fadepoint: 2,
        lifespan: 3,
        offsetX: 0,
        offsetY: 0,
        offsetZ: 0,
        velocityX: 0,
        velocityY: 0.03,
        color: Color.white,
    }

    public static BASH: Readonly<TextTagPreset> = Object.assign({}, TextTag.BASE, {
        color: Color.of(0, 0, 255),
        velocityY: 0.04,
        lifespan: 5,
    })

    public static CRITICAL_STRIKE: Readonly<TextTagPreset> = Object.assign({}, TextTag.BASE, {
        color: Color.of(255, 0, 0),
        velocityY: 0.04,
        lifespan: 5,
    })

    public static GOLD_BOUNTY: Readonly<TextTagPreset> = Object.assign({}, TextTag.BASE, {
        color: Color.of(255, 220, 0),
    })

    public static LUMBER_BOUNTY: Readonly<TextTagPreset> = Object.assign({}, TextTag.BASE, {
        color: Color.of(0, 200, 80),
    })

    public static MANA_BURN: Readonly<TextTagPreset> = Object.assign({}, TextTag.BASE, {
        color: Color.of(82, 82, 255),
        velocityY: 0.04,
        lifespan: 5,
    })

    public static MISS: Readonly<TextTagPreset> = Object.assign({}, TextTag.BASE, {
        fadepoint: 1,
        color: Color.of(255, 0, 0),
    })

    public static SHADOW_STRIKE: Readonly<TextTagPreset> = Object.assign({}, TextTag.BASE, {
        color: Color.of(160, 255, 0),
        velocityY: 0.04,
        lifespan: 5,
    })

    public static flash(
        configuration: Readonly<TextTagPreset>,
        text: string,
        x: number,
        y: number,
        z?: number,
    ): void {
        const textTag = createTextTag()
        setTextTagText(textTag, text, DEFAULT_FONT_SIZE)
        setTextTagPos(
            textTag,
            x + configuration.offsetX,
            y + configuration.offsetY,
            (z ?? 0) + configuration.offsetZ,
        )
        applyConfiguration(textTag, configuration)
    }

    public static create(
        configuration: Readonly<TextTagPreset>,
        text: string,
        unit: Unit,
    ): TextTag {
        const textTag = new TextTag()
        textTag[TextTagPropertyKey.UNIT] = unit
        textTag[TextTagPropertyKey.CONFIGURATION] = configuration
        ensureHandle(textTag)
        unitTextTags.add(textTag)
        return textTag
    }
}

Timer.onPeriod[1 / 64].addListener(() => {
    for (const textTag of unitTextTags) {
        const unit = textTag[TextTagPropertyKey.UNIT]!.handle
        const x = getUnitX(unit)
        const y = getUnitY(unit)
        const [, , isInView] = worldCoordinatesToFrame(
            x,
            y,
            getUnitFlyHeight(unit) + getTerrainZ(x, y),
        )
        if (
            isInView &&
            !isUnitHidden(unit) &&
            !isUnitLoaded(unit) &&
            isUnitVisible(unit, PLAYER_LOCAL_HANDLE)
        ) {
            setTextTagPosUnit(
                ensureHandle(textTag),
                unit,
                textTag[TextTagPropertyKey.CONFIGURATION]!.offsetZ,
            )
        } else if (textTag[TextTagPropertyKey.HANDLE] !== undefined) {
            destroyTextTag(textTag[TextTagPropertyKey.HANDLE])
            textTag[TextTagPropertyKey.HANDLE] = undefined
        }
    }
})
