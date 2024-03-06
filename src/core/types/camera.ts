export class Camera {
    public static setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
        SetCameraBounds(minX, minY, minX, maxY, maxX, maxY, maxX, minY)
    }
}
