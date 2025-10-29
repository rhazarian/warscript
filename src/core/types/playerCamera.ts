import { Timer } from "./timer"
import type { Unit } from "../../engine/internal/unit"
import { EventListenerPriority } from "../../event"
import { PLAYER_LOCAL_HANDLE } from "../../engine/internal/misc/player-local-handle"
import { check } from "../../utility/preconditions"
import {
    FRAME_MAX_Y,
    FRAME_MIN_Y,
    getFrameMinXMaxX,
} from "../../engine/internal/misc/frame-coordinates"
import { getTerrainZ } from "../../engine/internal/misc/get-terrain-z"

const getHandleId = GetHandleId
const setCameraField = SetCameraField
const getCameraField = GetCameraField
const setCameraPosition = SetCameraPosition
const getCameraEyePositionX = GetCameraEyePositionX
const getCameraEyePositionY = GetCameraEyePositionY
const getCameraEyePositionZ = GetCameraEyePositionZ
const getCameraTargetPositionX = GetCameraTargetPositionX
const getCameraTargetPositionY = GetCameraTargetPositionY
const resetToGameCamera = ResetToGameCamera

const cos = math.cos
const deg = math.deg
const sin = math.sin
const sqrt = math.sqrt

const memoized: Record<number, PlayerCamera | undefined> = {}

export class PlayerCamera {
    private readonly player: jplayer
    private readonly isLocal: boolean

    private constructor(player: jplayer) {
        const id = getHandleId(player)
        check(memoized[id] === undefined)
        memoized[id] = this

        this.player = player
        this.isLocal = player == PLAYER_LOCAL_HANDLE
    }

    /** async */
    public get x(): number {
        return this.isLocal ? getCameraTargetPositionX() : 0
    }

    public set x(x: number) {
        if (this.isLocal) {
            setCameraPosition(x, getCameraTargetPositionY())
        }
    }

    /** async */
    public get y(): number {
        return this.isLocal ? getCameraTargetPositionY() : 0
    }

    public set y(y: number) {
        if (this.isLocal) {
            setCameraPosition(getCameraTargetPositionX(), y)
        }
    }

    /** async */
    public get zOffset(): number {
        return this.isLocal ? getCameraField(CAMERA_FIELD_ZOFFSET) : 0
    }

    public set zOffset(zOffset: number) {
        if (this.isLocal) {
            setCameraField(CAMERA_FIELD_ZOFFSET, zOffset, 0)
        }
    }

    /** async */
    public get distance(): number {
        return this.isLocal ? getCameraField(CAMERA_FIELD_TARGET_DISTANCE) : 0
    }

    public set distance(distance: number) {
        if (this.isLocal) {
            setCameraField(CAMERA_FIELD_TARGET_DISTANCE, distance, 0)
        }
    }

    /** async */
    public get farClipping(): number {
        return this.isLocal ? getCameraField(CAMERA_FIELD_FARZ) : 0
    }

    public set farClipping(farClipping: number) {
        if (this.isLocal) {
            setCameraField(CAMERA_FIELD_FARZ, farClipping, 0)
        }
    }

    /** async */
    public get yaw(): number {
        return this.isLocal ? deg(getCameraField(CAMERA_FIELD_ROTATION)) : 0
    }

    public set yaw(v: number) {
        if (this.isLocal) {
            setCameraField(CAMERA_FIELD_ROTATION, v, 0)
        }
    }

    /** async */
    public get pitch(): number {
        return this.isLocal ? deg(getCameraField(CAMERA_FIELD_ANGLE_OF_ATTACK)) : 0
    }

    public set pitch(v: number) {
        if (this.isLocal) {
            setCameraField(CAMERA_FIELD_ANGLE_OF_ATTACK, v, 0)
        }
    }

    /** async */
    public get roll(): number {
        return this.isLocal ? deg(getCameraField(CAMERA_FIELD_ROLL)) : 0
    }

    public set roll(v: number) {
        if (this.isLocal) {
            setCameraField(CAMERA_FIELD_ROLL, v, 0)
        }
    }

    public reset(): void {
        if (this.isLocal) {
            resetToGameCamera(0)
        }
    }

    public static isUnitInView(unit: Unit): boolean {
        const [, , isInView] = worldCoordinatesToFrame(unit.x, unit.y, unit.z)
        return isInView
    }

    public static of(player: jplayer): PlayerCamera {
        return memoized[getHandleId(player)] ?? new PlayerCamera(player)
    }
}

let cameraEyeX = 0
let cameraEyeY = 0
let cameraEyeZ = 0
let cameraAngleOfAttack = 0
let cameraAngleOfAttackCos = 0
let cameraAngleOfAttackSin = 0
let cameraRotation = 0
let cameraRotationCos = 0
let cameraRotationSin = 0
let cameraAngleOfAttackCosRotationCos = 0
let cameraAngleOfAttackCosRotationSin = 0
let cameraAngleOfAttackSinRotationCos = 0
let cameraAngleOfAttackSinRotationSin = 0

let yCenterScreenShift = 0
let scaleFactor = 0

let frameMinX = 0
let frameMaxX = 0

let isCameraViewPrecalculated = false
const precalculateCameraView = (): void => {
    cameraEyeX = getCameraEyePositionX()
    cameraEyeY = getCameraEyePositionY()
    cameraEyeZ = getCameraEyePositionZ()
    cameraAngleOfAttack = getCameraField(CAMERA_FIELD_ANGLE_OF_ATTACK)
    cameraAngleOfAttackCos = cos(cameraAngleOfAttack)
    cameraAngleOfAttackSin = sin(cameraAngleOfAttack)
    cameraRotation = getCameraField(CAMERA_FIELD_ROTATION)
    cameraRotationCos = cos(cameraRotation)
    cameraRotationSin = sin(cameraRotation)
    cameraAngleOfAttackCosRotationCos = cameraAngleOfAttackCos * cameraRotationCos
    cameraAngleOfAttackCosRotationSin = cameraAngleOfAttackCos * cameraRotationSin
    cameraAngleOfAttackSinRotationCos = cameraAngleOfAttackSin * cameraRotationCos
    cameraAngleOfAttackSinRotationSin = cameraAngleOfAttackSin * cameraRotationSin

    yCenterScreenShift = 0.1284 * cameraAngleOfAttackCos
    const cameraFieldOfView = getCameraField(CAMERA_FIELD_FIELD_OF_VIEW)
    scaleFactor =
        0.0524 * cameraFieldOfView ** 3 -
        0.0283 * cameraFieldOfView ** 2 +
        1.061 * cameraFieldOfView
    ;[frameMinX, frameMaxX] = getFrameMinXMaxX()

    isCameraViewPrecalculated = true
}
Timer.onPeriod[1 / 64].addListener(EventListenerPriority.HIGHEST, () => {
    isCameraViewPrecalculated = false
})

/** @internal For use by internal systems only. */
export const worldCoordinatesToFrame = (
    x: number,
    y: number,
    z: number,
): LuaMultiReturn<[x: number, n: number, isInView: boolean]> => {
    if (!isCameraViewPrecalculated) {
        precalculateCameraView()
    }
    const dx = x - cameraEyeX
    const dy = y - cameraEyeY
    const dz = z - cameraEyeZ

    const xPrime =
        scaleFactor *
        (-cameraAngleOfAttackCosRotationCos * dx -
            cameraAngleOfAttackCosRotationSin * dy -
            cameraAngleOfAttackSin * dz)

    const frameX = 0.4 + (cameraRotationCos * dy - cameraRotationSin * dx) / xPrime
    const frameY =
        0.42625 -
        yCenterScreenShift +
        (cameraAngleOfAttackSinRotationCos * dx +
            cameraAngleOfAttackSinRotationSin * dy -
            cameraAngleOfAttackCos * dz) /
            xPrime

    return $multi(
        frameX,
        frameY,
        xPrime < 0 &&
            frameX >= frameMinX &&
            frameX <= frameMaxX &&
            frameY >= FRAME_MIN_Y &&
            frameY <= FRAME_MAX_Y,
    )
}

/** @internal For use by internal systems only. */
export const frameCoordinatesToWorld = (
    x: number,
    y: number,
): LuaMultiReturn<[x: number, y: number, z: number, isDefinite: boolean]> => {
    if (!isCameraViewPrecalculated) {
        precalculateCameraView()
    }

    const a = (x - 0.4) * scaleFactor
    const b = (0.42625 - yCenterScreenShift - y) * scaleFactor

    // The vector pointing towards the mouse cursor in the camera's coordinate system.
    const nx = 1 / sqrt(1 + a * a + b * b)
    let ny = sqrt(1 - (1 + b * b) * nx * nx)
    let nz = sqrt(1 - nx * nx - ny * ny)
    if (a > 0) {
        ny = -ny
    }
    if (b < 0) {
        nz = -nz
    }

    //The vector pointing from the camera eye position to the mouse cursor.
    const nxPrime =
        cameraAngleOfAttackCosRotationCos * nx -
        cameraRotationSin * ny +
        cameraAngleOfAttackSinRotationCos * nz
    const nyPrime =
        cameraAngleOfAttackCosRotationSin * nx +
        cameraRotationCos * ny +
        cameraAngleOfAttackSinRotationSin * nz
    const nzPrime = -cameraAngleOfAttackSin * nx + cameraAngleOfAttackCos * nz

    let zGuess = getTerrainZ(cameraEyeX, cameraEyeY)
    let xGuess = cameraEyeX + (nxPrime * (cameraEyeZ - zGuess)) / nzPrime
    let yGuess = cameraEyeY + (nyPrime * (cameraEyeZ - zGuess)) / nzPrime
    let zWorld = getTerrainZ(xGuess, yGuess)
    let deltaZ = zWorld - zGuess
    zGuess = zWorld

    let zWorldOld = zWorld
    let deltaZOld = deltaZ

    let i = 0
    while ((deltaZ > 1 || deltaZ < -1) && i < 50) {
        xGuess = cameraEyeX + (nxPrime * (cameraEyeZ - zGuess)) / nzPrime
        yGuess = cameraEyeY + (nyPrime * (cameraEyeZ - zGuess)) / nzPrime

        zWorld = getTerrainZ(xGuess, yGuess)
        deltaZ = zWorld - zGuess
        zGuess = (deltaZOld * zWorld - deltaZ * zWorldOld) / (deltaZOld - deltaZ)
        zWorldOld = zWorld
        deltaZOld = deltaZ
        i++
    }

    return $multi(xGuess, yGuess, zWorld, i < 50)
}
