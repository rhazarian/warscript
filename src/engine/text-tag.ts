import { Color } from "../core/types/color"
import { Unit } from "./internal/unit"
import { Timer } from "../core/types/timer"
import { AbstractDestroyable, Destructor } from "../destroyable"
import { worldCoordinatesToFrame } from "../core/types/playerCamera"
import { PLAYER_LOCAL_HANDLE } from "./internal/misc/player-local-handle"

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
const getUnitZ = BlzGetUnitZ
const unitAlive = UnitAlive

const DEFAULT_FONT_SIZE = 0.024

// A shown unit text tag follows its unit every tick, but whether the unit is in the camera view
// and visible (not hidden, loaded, fogged or dead) is checked only every this many ticks,
// staggered across the text tags; a hidden text tag costs nothing between the checks.
const VISIBILITY_CHECK_INTERVAL = 4

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
    UNIT_X,
    UNIT_Y,
    UNIT_Z,
    UNIT_FLY_HEIGHT,
    IS_VISIBILITY_CHECK_PENDING,
    VISIBILITY_CHECK_PHASE,
}

let nextVisibilityCheckPhase = 0

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
    private [TextTagPropertyKey.UNIT_X]?: number
    private [TextTagPropertyKey.UNIT_Y]?: number
    private [TextTagPropertyKey.UNIT_Z]?: number
    private [TextTagPropertyKey.UNIT_FLY_HEIGHT]?: number
    private [TextTagPropertyKey.IS_VISIBILITY_CHECK_PENDING]?: true
    private [TextTagPropertyKey.VISIBILITY_CHECK_PHASE]?: number

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

    // A missing handle belongs to a unit text tag the update loop does not show (or to a
    // destroyed text tag): the text, font size and color are only stored then, and
    // `ensureHandle` applies them once the update loop shows the text tag.
    public set text(text: string) {
        if (text == this[TextTagPropertyKey.TEXT]) {
            return
        }
        this[TextTagPropertyKey.TEXT] = text
        const handle = this[TextTagPropertyKey.HANDLE]
        if (handle !== undefined) {
            setTextTagText(handle, text, this[TextTagPropertyKey.FONT_SIZE] ?? DEFAULT_FONT_SIZE)
        }
    }

    public get fontSize(): number {
        return this[TextTagPropertyKey.FONT_SIZE] ?? DEFAULT_FONT_SIZE
    }

    public set fontSize(fontSize: number) {
        if (fontSize == this[TextTagPropertyKey.FONT_SIZE]) {
            return
        }
        this[TextTagPropertyKey.FONT_SIZE] = fontSize
        const handle = this[TextTagPropertyKey.HANDLE]
        if (handle !== undefined) {
            setTextTagText(handle, this[TextTagPropertyKey.TEXT] ?? "", fontSize)
        }
    }

    public get color(): Color {
        return this[TextTagPropertyKey.COLOR] ?? Color.white
    }

    public set color(color: Color) {
        if (color == this[TextTagPropertyKey.COLOR]) {
            return
        }
        this[TextTagPropertyKey.COLOR] = color
        const handle = this[TextTagPropertyKey.HANDLE]
        if (handle !== undefined) {
            setTextTagColor(handle, color.r, color.g, color.b, color.a)
        }
    }

    public get unit(): Unit | undefined {
        return this[TextTagPropertyKey.UNIT]
    }

    public set unit(unit: Unit | undefined) {
        if (unit !== undefined) {
            this[TextTagPropertyKey.X] = undefined
            this[TextTagPropertyKey.Y] = undefined
            // Make the update loop place the text tag and check the new unit on the next tick.
            this[TextTagPropertyKey.UNIT_X] = undefined
            this[TextTagPropertyKey.UNIT_Y] = undefined
            this[TextTagPropertyKey.UNIT_FLY_HEIGHT] = undefined
            this[TextTagPropertyKey.IS_VISIBILITY_CHECK_PENDING] = true
            const handle = this[TextTagPropertyKey.HANDLE]
            if (handle !== undefined) {
                setTextTagPosUnit(
                    handle,
                    unit.handle,
                    this[TextTagPropertyKey.CONFIGURATION]!.offsetZ,
                )
            }
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
        textTag[TextTagPropertyKey.TEXT] = text
        textTag[TextTagPropertyKey.UNIT] = unit
        textTag[TextTagPropertyKey.CONFIGURATION] = configuration
        textTag[TextTagPropertyKey.VISIBILITY_CHECK_PHASE] = nextVisibilityCheckPhase
        nextVisibilityCheckPhase = (nextVisibilityCheckPhase + 1) % VISIBILITY_CHECK_INTERVAL
        // The update loop creates the handle on the next tick if the unit turns out to be in
        // the camera view and visible to the local player.
        textTag[TextTagPropertyKey.IS_VISIBILITY_CHECK_PENDING] = true
        unitTextTags.add(textTag)
        return textTag
    }
}

let visibilityCheckPhase = 0

Timer.onPeriod[1 / 64].addListener(() => {
    visibilityCheckPhase = (visibilityCheckPhase + 1) % VISIBILITY_CHECK_INTERVAL
    for (const textTag of unitTextTags) {
        const handle = textTag[TextTagPropertyKey.HANDLE]
        const isVisibilityCheckDue =
            textTag[TextTagPropertyKey.IS_VISIBILITY_CHECK_PENDING] ||
            textTag[TextTagPropertyKey.VISIBILITY_CHECK_PHASE] == visibilityCheckPhase
        // The existence of the handle is the result of the last check.
        if (handle !== undefined || isVisibilityCheckDue) {
            const unit = textTag[TextTagPropertyKey.UNIT]!.handle
            const x = getUnitX(unit)
            const y = getUnitY(unit)
            const flyHeight = getUnitFlyHeight(unit)
            // The stored position is the one read last; an existing handle stands there.
            let hasPositionChanged = flyHeight != textTag[TextTagPropertyKey.UNIT_FLY_HEIGHT]
            if (
                x != textTag[TextTagPropertyKey.UNIT_X] ||
                y != textTag[TextTagPropertyKey.UNIT_Y]
            ) {
                textTag[TextTagPropertyKey.UNIT_X] = x
                textTag[TextTagPropertyKey.UNIT_Y] = y
                textTag[TextTagPropertyKey.UNIT_Z] = undefined
                hasPositionChanged = true
            }
            textTag[TextTagPropertyKey.UNIT_FLY_HEIGHT] = flyHeight
            let isShown = handle !== undefined
            if (isVisibilityCheckDue) {
                textTag[TextTagPropertyKey.IS_VISIBILITY_CHECK_PENDING] = undefined
                // The camera is checked first: a shown text tag reads the position anyway, and
                // the projection itself is plain arithmetic. The unit's z (without the fly
                // height) is read again only after the unit has moved.
                let z = textTag[TextTagPropertyKey.UNIT_Z]
                if (z === undefined) {
                    z = getUnitZ(unit)
                    textTag[TextTagPropertyKey.UNIT_Z] = z
                }
                const [, , isInView] = worldCoordinatesToFrame(x, y, flyHeight + z)
                isShown =
                    isInView &&
                    !isUnitHidden(unit) &&
                    !isUnitLoaded(unit) &&
                    isUnitVisible(unit, PLAYER_LOCAL_HANDLE) &&
                    unitAlive(unit)
            }
            if (!isShown) {
                if (handle !== undefined) {
                    destroyTextTag(handle)
                    textTag[TextTagPropertyKey.HANDLE] = undefined
                }
            } else if (handle === undefined) {
                // Placed at the unit on creation.
                ensureHandle(textTag)
            } else if (hasPositionChanged) {
                setTextTagPosUnit(handle, unit, textTag[TextTagPropertyKey.CONFIGURATION]!.offsetZ)
            }
        }
    }
})
