import { Color } from "../core/types/color"
import { Unit } from "./internal/unit"
import { Timer } from "../core/types/timer"
import { AbstractDestroyable, Destructor } from "../destroyable"

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
    CONFIGURATION,
}

export class TextTag extends AbstractDestroyable {
    private [TextTagPropertyKey.UNIT]?: junit
    private [TextTagPropertyKey.CONFIGURATION]?: Readonly<TextTagPreset>

    private constructor(private readonly handle: jtexttag) {
        super()
    }

    protected override onDestroy(): Destructor {
        destroyTextTag(this.handle)
        unitTextTags.delete(this)
        return super.onDestroy()
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
        const handle = createTextTag()
        setTextTagText(handle, text, DEFAULT_FONT_SIZE)
        setTextTagPosUnit(handle, unit.handle, configuration.offsetZ)
        applyConfiguration(handle, configuration)
        setTextTagPermanent(handle, true)
        const textTag = new TextTag(handle)
        textTag[TextTagPropertyKey.UNIT] = unit.handle
        textTag[TextTagPropertyKey.CONFIGURATION] = configuration
        unitTextTags.add(textTag)
        return textTag
    }
}

Timer.onPeriod[1 / 64].addListener(() => {
    for (const textTag of unitTextTags) {
        setTextTagPosUnit(
            textTag["handle"],
            textTag[TextTagPropertyKey.UNIT]!,
            textTag[TextTagPropertyKey.CONFIGURATION]!.offsetZ,
        )
    }
})
