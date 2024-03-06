import { Color } from "../core/types/color"

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

export class TextTag {
    private constructor(private readonly handle: jtexttag) {}

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
        z?: number
    ): void {
        const textTag = createTextTag()
        setTextTagText(textTag, text, DEFAULT_FONT_SIZE)
        setTextTagPos(
            textTag,
            x + configuration.offsetX,
            y + configuration.offsetY,
            (z ?? 0) + configuration.offsetZ
        )
        setTextTagFadepoint(textTag, configuration.fadepoint)
        setTextTagLifespan(textTag, configuration.lifespan)
        const color = configuration.color
        setTextTagColor(textTag, color.r, color.g, color.b, color.a)
        setTextTagVelocity(textTag, configuration.velocityX, configuration.velocityY)
        setTextTagPermanent(textTag, false)
        setTextTagVisibility(textTag, true)
    }
}
