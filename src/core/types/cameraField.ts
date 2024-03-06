import { Handle } from "./handle"

export class CameraField extends Handle<jcamerafield> {
    public static targetDistance: CameraField
    public static fieldOfView: CameraField
    public static farClipping: CameraField
    public static nearClipping: CameraField
    public static zOffset: CameraField
    public static yaw: CameraField
    public static pitch: CameraField
    public static roll: CameraField

    private static readonly _init = util.contextFn("warscript/cameraField/init", () => {
        CameraField.targetDistance = CameraField.of(CAMERA_FIELD_TARGET_DISTANCE)
        CameraField.farClipping = CameraField.of(CAMERA_FIELD_FARZ)
        CameraField.pitch = CameraField.of(CAMERA_FIELD_ANGLE_OF_ATTACK)
        CameraField.fieldOfView = CameraField.of(CAMERA_FIELD_FIELD_OF_VIEW)
        CameraField.roll = CameraField.of(CAMERA_FIELD_ROLL)
        CameraField.yaw = CameraField.of(CAMERA_FIELD_ROTATION)
        CameraField.zOffset = CameraField.of(CAMERA_FIELD_ZOFFSET)
        CameraField.nearClipping = CameraField.of(CAMERA_FIELD_NEARZ)
    })

    public get value(): number {
        return GetCameraField(this.handle)
    }

    public set value(v: number) {
        SetCameraField(this.handle, v, 0)
    }
}
