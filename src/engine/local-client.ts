import { Unit } from "../core/types/unit"
import { Async } from "../core/types/async"
import { Event, TriggerEvent } from "../event"
import { GraphicsMode } from "./index"
import { Frame } from "../core/types/frame"
import { Player } from "../core/types/player"
import { Timer } from "../core/types/timer"

const loadTOCFile = BlzLoadTOCFile
const getLocalClientWidth = BlzGetLocalClientWidth
const getLocalClientHeight = BlzGetLocalClientHeight
const isLocalClientActive = BlzIsLocalClientActive
const isHeroUnitId = IsHeroUnitId
const getHandleId = GetHandleId
const getMouseFocusUnit = BlzGetMouseFocusUnit
const getUnitRealField = BlzGetUnitRealField
const getUnitTypeId = GetUnitTypeId
const getLocale = BlzGetLocale

const tableSort = table.sort

const tocPath = "_warscript\\IsHD.toc"

compiletime(() => {
    if (currentMap) {
        const fdfPath = "_warscript\\IsHD.fdf"
        currentMap.addFileString(`_HD.w3mod\\${fdfPath}`, "\r\n")
        currentMap.addFileString(`_HD.w3mod\\${tocPath}`, `${fdfPath}\r\n`)
    }
})

let selectionButtons: Frame[] | undefined

Timer.run(() => {
    selectionButtons = Frame.byName("SimpleInfoPanelUnitDetail")
        .parent.getChild(5)
        .getChild(0)
        .children.map((frame) => frame.getChild(1))
})

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

    public static get isHD(): boolean {
        return false
    }

    public static get graphicsMode(): GraphicsMode {
        return this.isHD ? GraphicsMode.HD : GraphicsMode.SD
    }

    public static get isActive(): boolean {
        return isLocalClientActive()
    }

    public static get mouseFocusUnit(): Async<Unit> | undefined {
        return Unit.of(getMouseFocusUnit())
    }

    public static get mainSelectedUnit(): Async<Unit> | undefined {
        Unit.getSelectionOf(Player.local, localSelectedUnits)

        for (const i of $range(1, localSelectedUnits.length)) {
            indexByLocalSelectedUnit.set(localSelectedUnits[i - 1], i)
        }

        tableSort(localSelectedUnits, compareUnitsSelectionPriority)

        let mainSelectedUnitIndex: number | undefined
        if (selectionButtons && localSelectedUnits.length > 1) {
            let maxButtonWidth = 0
            for (const i of $range(0, selectionButtons.length - 1)) {
                const width = selectionButtons[i].width
                if (width > maxButtonWidth) {
                    maxButtonWidth = width
                    mainSelectedUnitIndex = i
                }
            }
        }

        const mainSelectedUnit = localSelectedUnits[mainSelectedUnitIndex ?? 0]

        for (const i of $range(1, localSelectedUnits.length)) {
            indexByLocalSelectedUnit.delete(localSelectedUnits[i - 1])
            localSelectedUnits[i - 1] = undefined!
        }

        if (
            mainSelectedUnitChangeEvent != undefined &&
            mainSelectedUnit != previousMainSelectedUnit
        ) {
            const previousPreviousMainSelectedUnit = previousMainSelectedUnit
            previousMainSelectedUnit = mainSelectedUnit
            Event.invoke(
                mainSelectedUnitChangeEvent,
                previousPreviousMainSelectedUnit,
                previousMainSelectedUnit,
            )
        }

        return mainSelectedUnit
    }

    public static get mainSelectedUnitChangeEvent(): Event<
        [previousMainSelectedUnit: Unit | undefined, newMainSelectedUnit: Unit | undefined]
    > {
        if (mainSelectedUnitChangeEvent == undefined) {
            mainSelectedUnitChangeEvent = new Event()
            Timer.onPeriod[1 / 64].addListener(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _ = LocalClient.mainSelectedUnit
            })
        }
        return mainSelectedUnitChangeEvent
    }

    public static readonly onDisconnect = new TriggerEvent(
        (trigger) => {
            TriggerRegisterGameStateEvent(trigger, GAME_STATE_DISCONNECTED, NOT_EQUAL, 0)
        },
        () => $multi(),
    )
}

warpack.afterMapInit(() => {
    rawset(LocalClient, "isHD", loadTOCFile(tocPath))
})
