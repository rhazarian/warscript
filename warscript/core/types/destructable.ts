import { Handle, HandleDestructor } from "./handle"
import { Event, TriggerEvent } from "../../event"
import { ReadonlyRect, Rect } from "./rect"

const setRect = SetRect
const getEnumDestructable = GetEnumDestructable
const createDestructable = CreateDestructable
const createDestructableZ = CreateDestructableZ
const removeDestructable = RemoveDestructable
const killDestructable = KillDestructable
const setDestructableInvulnerable = SetDestructableInvulnerable
const isDestructableInvulnerable = IsDestructableInvulnerable
const enumDestructablesInRect = EnumDestructablesInRect
const getDestructableTypeId = GetDestructableTypeId
const getDestructableX = GetDestructableX
const getDestructableY = GetDestructableY
const setDestructableLife = SetDestructableLife
const getDestructableLife = GetDestructableLife
const setDestructableMaxLife = SetDestructableMaxLife
const getDestructableMaxLife = GetDestructableMaxLife
const destructableRestoreLife = DestructableRestoreLife
const queueDestructableAnimation = QueueDestructableAnimation
const setDestructableAnimation = SetDestructableAnimation
const getDestructableName = GetDestructableName

const enumRect = Rect.create(0, 0, 0, 0).handle

export class Destructable extends Handle<jdestructable> {
    protected override onDestroy(): HandleDestructor {
        killDestructable(this.handle)
        removeDestructable(this.handle)
        return super.onDestroy()
    }

    public get typeId(): number {
        const typeId = getDestructableTypeId(this.handle)
        rawset(this, "typeId", typeId)
        return typeId
    }

    public get name(): string {
        return getDestructableName(this.handle)
    }

    public get x(): number {
        return getDestructableX(this.handle)
    }

    public get y(): number {
        return getDestructableY(this.handle)
    }

    public get position(): Vec2 {
        return vec2(getDestructableX(this.handle), getDestructableY(this.handle))
    }

    public get isInvulnerable(): boolean {
        return isDestructableInvulnerable(this.handle)
    }

    public set isInvulnerable(isInvulnerable: boolean) {
        setDestructableInvulnerable(this.handle, isInvulnerable)
    }

    public get maxHealth(): number {
        return getDestructableMaxLife(this.handle)
    }

    public set maxHealth(v: number) {
        setDestructableMaxLife(this.handle, v)
    }

    public get health(): number {
        return getDestructableLife(this.handle)
    }

    public set health(v: number) {
        setDestructableLife(this.handle, v)
    }

    public static create(
        id: number,
        x: number,
        y: number,
        facing: number,
        scale: number,
        variation: number
    ): Destructable | null {
        return Destructable.of(createDestructable(id, x, y, facing, scale, variation))
    }

    public static createZ(
        id: number,
        x: number,
        y: number,
        z: number,
        facing: number,
        scale: number,
        variation: number
    ): Destructable | null {
        return Destructable.of(createDestructableZ(id, x, y, z, facing, scale, variation))
    }

    public static getInRange(x: number, y: number, range: number): Destructable[] {
        const collection: Destructable[] = []
        setRect(enumRect, x - range, y - range, x + range, y + range)
        enumDestructablesInRect(enumRect, undefined, () => {
            collection[collection.length] = Destructable.of(getEnumDestructable())
        })
        return collection
    }

    public static getInRect(rect: ReadonlyRect): Destructable[] {
        const collection: Destructable[] = []
        enumDestructablesInRect(rect.handle, undefined, () => {
            collection[collection.length] = Destructable.of(getEnumDestructable())
        })
        return collection
    }

    public static get onCreate(): Event<[Destructable]> {
        return this.onCreateEvent
    }

    public static get onDestroy(): Event<[Destructable]> {
        return this.onDestroyEvent
    }

    public static readonly onDeath = new TriggerEvent(
        (trigger) => {
            const rect = GetWorldBounds()
            enumDestructablesInRect(rect, undefined, () => {
                TriggerRegisterDeathEvent(trigger, getEnumDestructable())
            })
            RemoveRect(rect)
            Destructable.onCreate.addListener((destructable) => {
                TriggerRegisterDeathEvent(trigger, destructable.handle)
            })
        },
        () => $multi(Destructable.of(GetDyingDestructable()))
    )

    public setAnimation(animation: string): void {
        setDestructableAnimation(this.handle, animation)
    }

    public queueAnimation(animation: string): void {
        queueDestructableAnimation(this.handle, animation)
    }

    public restore(): void {
        destructableRestoreLife(this.handle, getDestructableMaxLife(this.handle), true)
    }

    public kill(): void {
        killDestructable(this.handle)
    }

    public get isAlive(): boolean {
        return getDestructableLife(this.handle) > 0
    }

    public get isDead(): boolean {
        return getDestructableLife(this.handle) <= 0
    }
}
