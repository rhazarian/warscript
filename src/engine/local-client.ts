import { Unit } from "../core/types/unit"
import { Async } from "../core/types/async"
import { TriggerEvent } from "../event"
import { GraphicsMode } from "./index"

const loadTOCFile = BlzLoadTOCFile
const getLocalClientWidth = BlzGetLocalClientWidth
const getLocalClientHeight = BlzGetLocalClientHeight
const isLocalClientActive = BlzIsLocalClientActive
const getMouseFocusUnit = BlzGetMouseFocusUnit
const getLocale = BlzGetLocale

const tocPath = "_warscript\\IsHD.toc"

compiletime(() => {
    if (currentMap) {
        const fdfPath = "_warscript\\IsHD.fdf"
        currentMap.addFileString(`_HD.w3mod\\${fdfPath}`, "\r\n")
        currentMap.addFileString(`_HD.w3mod\\${tocPath}`, `${fdfPath}\r\n`)
    }
})

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

    public static get mouseFocusUnit(): Async<Unit> {
        return Unit.of(getMouseFocusUnit())
    }

    public static readonly onDisconnect = new TriggerEvent(
        (trigger) => {
            TriggerRegisterGameStateEvent(trigger, GAME_STATE_DISCONNECTED, NOT_EQUAL, 0)
        },
        () => $multi()
    )
}

warpack.afterMapInit(() => {
    rawset(LocalClient, "isHD", loadTOCFile(tocPath))
})
