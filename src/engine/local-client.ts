import { Unit } from "../core/types/unit"
import { Async } from "../core/types/async"
import { Event, TriggerEvent } from "../event"
import { GraphicsMode } from "./index"
import { Frame } from "../core/types/frame"
import { Player } from "../core/types/player"
import { Timer } from "../core/types/timer"
import { Color } from "../core/types/color"
import { array } from "../utility/arrays"

const frameToPixelX = BlzFrameToPixelX
const frameToPixelY = BlzFrameToPixelY
const getHandleId = GetHandleId
const getLocalClientHeight = BlzGetLocalClientHeight
const getLocalClientWidth = BlzGetLocalClientWidth
const getLocale = BlzGetLocale
const getMouseFocusUnit = BlzGetMouseFocusUnit
const getMouseScreenPosX = BlzGetMouseScreenPosX
const getMouseScreenPosY = BlzGetMouseScreenPosY
const frameGetText = BlzFrameGetText
const getUnitRealField = BlzGetUnitRealField
const getUnitState = GetUnitState
const getUnitTypeId = GetUnitTypeId
const isHeroUnitId = IsHeroUnitId
const isKeyPressed = BlzIsKeyPressed
const isLocalClientActive = BlzIsLocalClientActive
const isMetaKeyPressed = BlzIsMetaKeyPressed
const isMouseButtonPressed = BlzIsMouseButtonPressed
const loadTOCFile = BlzLoadTOCFile
const pingMinimap = PingMinimap
const pingMinimapEx = PingMinimapEx
const pixelToFrameX = BlzPixelToFrameX
const pixelToFrameY = BlzPixelToFrameY

const tableSort = table.sort

const hdTocPath = "_warscript\\IsHD.toc"
const deTocPath = "_warscript\\IsDE.toc"

compiletime(() => {
    if (currentMap) {
        const hdFdfPath = "_warscript\\IsHD.fdf"
        currentMap.addFileString(`_HD.w3mod\\${hdFdfPath}`, "\r\n")
        currentMap.addFileString(`_HD.w3mod\\${hdTocPath}`, `${hdFdfPath}\r\n`)
        const deFdfPath = "_warscript\\IsDE.fdf"
        currentMap.addFileString(`_DE.w3mod\\${deFdfPath}`, "\r\n")
        currentMap.addFileString(`_DE.w3mod\\${deTocPath}`, `${deFdfPath}\r\n`)
    }
})

/**
 * The portrait's health and mana texts show the focused unit's current and maximum values
 * as "current / maximum". Once they exist, these origin frames live for the whole game, so
 * the polling may read them every tick; the group panel's buttons, by contrast, are rebuilt
 * at any selection change and a retained button handle crashes the game on the first native
 * called with it. The frames are not there at map load, though, and appear at different
 * times on different clients: `Frame.byOrigin` returns undefined until then and balances
 * the handle allocation across clients, so it is asked again once a second.
 */
let portraitHpText: Frame | undefined
let portraitManaText: Frame | undefined

const actualizePortraitFrames = (): void => {
    portraitHpText = Frame.byOrigin(ORIGIN_FRAME_PORTRAIT_HP_TEXT)
    portraitManaText = Frame.byOrigin(ORIGIN_FRAME_PORTRAIT_MANA_TEXT)
}

/**
 * Finds "current / maximum" in the text, which may also carry color codes and other
 * decoration; returns -1 for both when there is no such pair.
 */
const parsePortraitValues = (frame: Frame | undefined): LuaMultiReturn<[number, number]> => {
    if (frame == undefined) {
        return $multi(-1, -1)
    }
    const text = frameGetText(frame.handle)
    const [current, maximum] = string.match(text, "(%d+)%s*/%s*(%d+)")
    if (current == undefined || maximum == undefined) {
        return $multi(-1, -1)
    }
    return $multi(tonumber(current) as number, tonumber(maximum) as number)
}

/** Whether a unit value can be what the portrait shows as `shown`; the rounding rule is unknown. */
const matchesPortraitValue = (value: number, shown: number): boolean => {
    return math.abs(value - shown) < 1
}

/** Whether the unit's health matches what the portrait shows; the health text is required. */
const matchesPortraitHealth = (unit: Unit, hp: number, maxHp: number): boolean => {
    const handle = unit.handle
    return (
        maxHp >= 0 &&
        matchesPortraitValue(getUnitState(handle, UNIT_STATE_LIFE), hp) &&
        matchesPortraitValue(getUnitState(handle, UNIT_STATE_MAX_LIFE), maxHp)
    )
}

/**
 * Whether the unit has mana and it matches what the portrait shows. The mana text is not
 * redrawn for a unit without mana (it keeps the previously focused unit's values), so a
 * mana match is evidence for a unit, but a mismatch is no evidence against one without mana.
 */
const matchesPortraitMana = (unit: Unit, mana: number, maxMana: number): boolean => {
    const handle = unit.handle
    const unitMaxMana = getUnitState(handle, UNIT_STATE_MAX_MANA)
    return (
        maxMana >= 0 &&
        unitMaxMana > 0 &&
        matchesPortraitValue(getUnitState(handle, UNIT_STATE_MANA), mana) &&
        matchesPortraitValue(unitMaxMana, maxMana)
    )
}

const localSelectedUnits: Unit[] = []
const indexByLocalSelectedUnit = new LuaMap<Unit, number>()

const compareUnitsSelectionPriority = (a: Unit, b: Unit): boolean => {
    const aHandle = a.handle
    const bHandle = b.handle

    const priorityDelta =
        getUnitRealField(bHandle, UNIT_RF_PRIORITY) - getUnitRealField(aHandle, UNIT_RF_PRIORITY)

    if (priorityDelta != 0) {
        return priorityDelta < 0
    }

    const aTypeId = getUnitTypeId(aHandle)
    const bTypeId = getUnitTypeId(bHandle)
    const orderDelta =
        (isHeroUnitId(aTypeId) ? getHandleId(aHandle) : aTypeId) -
        (isHeroUnitId(bTypeId) ? getHandleId(bHandle) : bTypeId)

    return (
        (orderDelta != 0
            ? orderDelta
            : indexByLocalSelectedUnit.get(a)! - indexByLocalSelectedUnit.get(b)!) < 0
    )
}

let mainSelectedUnitChangeEvent: Event<[Unit | undefined, Unit | undefined]>
let previousMainSelectedUnit: Unit | undefined
let currentMainSelectedUnit: Unit | undefined

let lastTargetingModeState = false
const targetingModeEnterEvent = new Event()
const targetingModeLeaveEvent = new Event()
const targetingModeStateChangeEvent = new Event()

export class LocalClient {
    private constructor() {
        // should not be instantiated
    }

    public static readonly locale = getLocale()

    public static get width(): number {
        return getLocalClientWidth()
    }

    public static get height(): number {
        return getLocalClientHeight()
    }

    public static get isSD(): boolean {
        return true
    }

    public static get isHD(): boolean {
        return false
    }

    public static get isDE(): boolean {
        return false
    }

    public static get graphicsMode(): GraphicsMode {
        return GraphicsMode.SD
    }

    public static get isActive(): boolean {
        return isLocalClientActive()
    }

    public static get isMinimized(): boolean {
        return getLocalClientHeight() == 0
    }

    public static pingMinimap(
        x: number,
        y: number,
        duration: number,
        ...parameters:
            | []
            | [red: number, green: number, blue: number, flashy?: boolean]
            | [color: Color, flashy?: boolean]
    ): void

    public static pingMinimap(
        x: number,
        y: number,
        duration: number,
        redOrColor?: number | Color,
        greenOrFlashy?: number | boolean,
        blue?: number,
        flashy?: boolean,
    ): void {
        if (redOrColor == undefined) {
            pingMinimap(x, y, duration)
        } else if (redOrColor instanceof Color) {
            pingMinimapEx(
                x,
                y,
                duration,
                redOrColor.r,
                redOrColor.g,
                redOrColor.b,
                (greenOrFlashy as boolean | undefined) || false,
            )
        } else {
            pingMinimapEx(
                x,
                y,
                duration,
                redOrColor,
                greenOrFlashy as number,
                blue as number,
                flashy || false,
            )
        }
    }

    /** Local input state; do not use to branch synchronized game logic. */
    public static isKeyPressed(key: joskeytype): boolean {
        return isKeyPressed(key)
    }

    /** Local input state. Uses the same modifier mask as Player key events. */
    public static isMetaKeyPressed(key: oskeymeta): boolean {
        return isMetaKeyPressed(key)
    }

    /** Local input state. */
    public static isMouseButtonPressed(button: jmousebuttontype): boolean {
        return isMouseButtonPressed(button)
    }

    public static get mouseScreenX(): number {
        return getMouseScreenPosX()
    }

    public static get mouseScreenY(): number {
        return getMouseScreenPosY()
    }

    public static screenToFrameX(x: number): number {
        return pixelToFrameX(x)
    }

    public static screenToFrameY(y: number): number {
        return pixelToFrameY(y)
    }

    public static frameToScreenX(x: number): number {
        return frameToPixelX(x)
    }

    public static frameToScreenY(y: number): number {
        return frameToPixelY(y)
    }

    public static get mouseFrameX(): number {
        return pixelToFrameX(getMouseScreenPosX())
    }

    public static get mouseFrameY(): number {
        return pixelToFrameY(getMouseScreenPosY())
    }

    public static get mouseFocusUnit(): Async<Unit> | undefined {
        return Unit.of(getMouseFocusUnit())
    }

    /**
     * Local selection sampled every 1/64 second; undefined before the first tick. Among
     * several selected units, the one the portrait shows, identified by its health and
     * mana; units with identical values cannot be told apart.
     */
    public static get mainSelectedUnit(): Async<Unit> | undefined {
        return currentMainSelectedUnit
    }

    public static get mainSelectedUnitChangeEvent(): Event<
        [previousMainSelectedUnit: Unit | undefined, newMainSelectedUnit: Unit | undefined]
    > {
        if (mainSelectedUnitChangeEvent == undefined) {
            mainSelectedUnitChangeEvent = new Event()
        }
        return mainSelectedUnitChangeEvent
    }

    public static get isInTargetingMode(): boolean {
        return actualizeTargetingModeState()
    }

    public static readonly targetingModeEnterEvent = targetingModeEnterEvent

    public static readonly targetingModeLeaveEvent = targetingModeLeaveEvent

    public static readonly targetingModeStateChangeEvent = targetingModeStateChangeEvent

    public static readonly onDisconnect = new TriggerEvent(
        (trigger) => {
            TriggerRegisterGameStateEvent(trigger, GAME_STATE_DISCONNECTED, NOT_EQUAL, 0)
        },
        () => $multi(),
    )
}

const actualizeMainSelectedUnit = (): void => {
    Unit.getSelectionOf(Player.local, localSelectedUnits)

    const selectionCount = localSelectedUnits.length
    for (const i of $range(1, selectionCount)) {
        indexByLocalSelectedUnit.set(localSelectedUnits[i - 1], i)
    }

    tableSort(localSelectedUnits, compareUnitsSelectionPriority)

    // The portrait shows the focused unit. Among several selected units, the first one in
    // selection priority order whose health and mana match the portrait is taken: units with
    // identical values cannot be told apart, and then the highest-priority one wins. When the
    // portrait shows no numbers (nothing focused yet, or the local UI still catching up), the
    // previous answer is kept if it is still selected, so the unit does not flicker.
    let mainSelectedUnit: Unit | undefined
    if (selectionCount <= 1) {
        mainSelectedUnit = localSelectedUnits[0]
    } else {
        const [hp, maxHp] = parsePortraitValues(portraitHpText)
        const [mana, maxMana] = parsePortraitValues(portraitManaText)
        if (maxHp >= 0) {
            // A unit matching both texts first; failing that, one matching the health text.
            let healthMatch: Unit | undefined
            for (const i of $range(1, selectionCount)) {
                const unit = localSelectedUnits[i - 1]
                if (matchesPortraitHealth(unit, hp, maxHp)) {
                    if (matchesPortraitMana(unit, mana, maxMana)) {
                        mainSelectedUnit = unit
                        break
                    }
                    if (healthMatch == undefined) {
                        healthMatch = unit
                    }
                }
            }
            if (mainSelectedUnit == undefined) {
                mainSelectedUnit = healthMatch
            }
        }
        if (mainSelectedUnit == undefined && previousMainSelectedUnit != undefined) {
            for (const i of $range(1, selectionCount)) {
                if (localSelectedUnits[i - 1] == previousMainSelectedUnit) {
                    mainSelectedUnit = previousMainSelectedUnit
                    break
                }
            }
        }
        if (mainSelectedUnit == undefined) {
            mainSelectedUnit = localSelectedUnits[0]
        }
    }

    for (const i of $range(1, selectionCount)) {
        indexByLocalSelectedUnit.delete(localSelectedUnits[i - 1])
        localSelectedUnits[i - 1] = undefined!
    }

    currentMainSelectedUnit = mainSelectedUnit

    if (mainSelectedUnitChangeEvent != undefined && mainSelectedUnit != previousMainSelectedUnit) {
        const previousPreviousMainSelectedUnit = previousMainSelectedUnit
        previousMainSelectedUnit = mainSelectedUnit
        Event.invoke(
            mainSelectedUnitChangeEvent,
            previousPreviousMainSelectedUnit,
            previousMainSelectedUnit,
        )
    }
}

const commandButtons = array(12, (i) => Frame.byOrigin(ORIGIN_FRAME_COMMAND_BUTTON, i))

const getTargetingModeState = (): boolean => {
    for (const i of $range(0, 10)) {
        if (commandButtons[i].visible) {
            return false
        }
    }
    return commandButtons[11].visible
}

const actualizeTargetingModeState = (): boolean => {
    if (getTargetingModeState()) {
        if (!lastTargetingModeState) {
            lastTargetingModeState = true
            Event.invoke(targetingModeEnterEvent)
            Event.invoke(targetingModeStateChangeEvent)
        }
        return true
    }
    if (lastTargetingModeState) {
        lastTargetingModeState = false
        Event.invoke(targetingModeLeaveEvent)
        Event.invoke(targetingModeStateChangeEvent)
    }
    return false
}

Timer.onPeriod[1].addListener(actualizePortraitFrames)
Timer.onPeriod[1 / 64].addListener(() => {
    actualizeMainSelectedUnit()
    actualizeTargetingModeState()
})

warpack.afterMapInit(() => {
    const isDE = loadTOCFile(deTocPath)
    const isHD = !isDE && loadTOCFile(hdTocPath)
    rawset(LocalClient, "isDE", isDE)
    rawset(LocalClient, "isHD", isHD)
    rawset(LocalClient, "isSD", !isDE && !isHD)
    rawset(
        LocalClient,
        "graphicsMode",
        isDE ? GraphicsMode.DE : isHD ? GraphicsMode.HD : GraphicsMode.SD,
    )
})
