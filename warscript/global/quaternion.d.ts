/** @noSelfInFile */

declare interface Quaternion {
    w: number
    x: number
    y: number
    z: number
}

declare namespace quaternion {
    function euler(yaw: number, pitch: number, roll: number): Quaternion
}
