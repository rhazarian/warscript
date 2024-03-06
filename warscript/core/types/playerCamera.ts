const getHandleId = GetHandleId
const setCameraField = SetCameraField
const getCameraField = GetCameraField
const setCameraPosition = SetCameraPosition
const getCameraTargetPositionX = GetCameraTargetPositionX
const getCameraTargetPositionY = GetCameraTargetPositionY
const resetToGameCamera = ResetToGameCamera

const deg = math.deg

const localPlayer = GetLocalPlayer()

const memoized: Record<number, PlayerCamera | undefined> = {}

export class PlayerCamera {
    private readonly player: jplayer
    private readonly isLocal: boolean

    private constructor(player: jplayer) {
        const id = getHandleId(player)
        if (memoized[id]) {
            error("Double-constructor run player camera!")
        }
        memoized[id] = this

        this.player = player
        this.isLocal = player == localPlayer
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

    public static of(player: jplayer): PlayerCamera {
        return memoized[getHandleId(player)] ?? new PlayerCamera(player)
    }
}
