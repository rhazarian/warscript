import { Widget } from "./types/widget"
import { Player } from "./types/player"

import { UnitAbility } from "./types/ability"
import { Unit } from "./types/unit"
import { dummyUnitId } from "../objutil/dummy"
import { checkNotNull } from "../utility/preconditions"
import { AbilityTypeId } from "../engine/object-data/entry/ability-type"
import { getOrderIdByAbilityTypeId } from "../engine/internal/ability"

const neutralVictim = Player.neutralVictim.handle

export class InstantDummyCaster {
    private static instance: InstantDummyCaster

    private readonly dummy: junit

    private constructor() {
        const dummy = CreateUnit(neutralVictim, dummyUnitId, 0, 0, 0)!
        ShowUnit(dummy, false)
        this.dummy = dummy
    }

    public static getInstance(): InstantDummyCaster {
        if (!this.instance) {
            this.instance = new this()
        }
        return this.instance
    }

    private prepare<T extends number | [...number[]]>(
        owner: Player,
        abilityId: T,
        level: T extends number
            ? number | ((ability: UnitAbility) => void)
            : number[] | ((...abilities: any[]) => void)
    ) {
        const dummy = this.dummy
        SetUnitOwner(dummy, owner.handle, false)
        if (typeof abilityId == "number") {
            UnitAddAbility(dummy, abilityId)
            if (typeof level == "number") {
                SetUnitAbilityLevel(dummy, abilityId, level + 1)
            } else {
                ;(level as (ability: UnitAbility) => void)(
                    UnitAbility.of(
                        checkNotNull(BlzGetUnitAbility(dummy, abilityId)),
                        abilityId,
                        Unit.of(dummy)
                    )
                )
            }
        } else {
            for (const i of $range(1, abilityId.length)) {
                UnitAddAbility(dummy, abilityId[i - 1])
            }
            if (Array.isArray(level)) {
                for (const i of $range(1, abilityId.length)) {
                    SetUnitAbilityLevel(dummy, abilityId[i - 1], level[i - 1] + 1)
                }
            } else {
                const abilities: UnitAbility[] = []
                for (const i of $range(1, abilityId.length)) {
                    abilities[i - 1] = UnitAbility.of(
                        checkNotNull(BlzGetUnitAbility(dummy, abilityId[i - 1])),
                        abilityId[i - 1],
                        Unit.of(dummy)
                    )
                }
                ;(level as (...abilities: UnitAbility[]) => void)(...abilities)
            }
        }
        SetUnitState(dummy, UNIT_STATE_MANA, 99999)
    }

    private finish(abilityId: number | number[]) {
        const dummy = this.dummy
        SetUnitOwner(dummy, neutralVictim, false)
        if (typeof abilityId == "number") {
            UnitRemoveAbility(dummy, abilityId)
        } else {
            for (const id of abilityId) {
                UnitRemoveAbility(dummy, id)
            }
        }
        ShowUnit(dummy, false)
    }

    public castTarget(
        owner: Player,
        abilityTypeId: number,
        level: number | ((ability: UnitAbility) => void),
        orderId: number,
        target: Widget,
        pos?: Vec2
    ): boolean

    public castTarget<T extends [number, ...number[]]>(
        owner: Player,
        abilityTypeId: T,
        level:
            | number[]
            | ((
                  ...abilities: {
                      [Index in keyof T]: UnitAbility
                  }
              ) => void),
        orderId: number,
        target: Widget,
        pos?: Vec2
    ): boolean

    public castTarget(
        owner: Player,
        abilityId: any,
        level: any,
        orderId: number,
        target: Widget,
        pos?: Vec2
    ): boolean {
        this.prepare(owner, abilityId, level)
        const dummy = this.dummy
        if (pos) {
            SetUnitX(dummy, pos.x)
            SetUnitY(dummy, pos.y)
            if (pos.z) {
                SetUnitFlyHeight(dummy, pos.z, 99999)
            }
        } else {
            SetUnitX(dummy, target.x)
            SetUnitY(dummy, target.y)
            SetUnitFlyHeight(dummy, 0, 99999)
        }
        const fm = CreateFogModifierRadius(
            owner.handle,
            FOG_OF_WAR_VISIBLE,
            target.x,
            target.y,
            128,
            false,
            false
        )
        FogModifierStart(fm)
        const result = IssueTargetOrderById(dummy, orderId, target.handle)
        FogModifierStop(fm)
        DestroyFogModifier(fm)
        this.finish(abilityId)
        return result
    }

    public cast(
        owner: Player,
        abilityTypeId: AbilityTypeId,
        ...args: [
            ...levelOrAbilityConsumer: [number] | [(ability: UnitAbility) => void] | [],
            x: number,
            y: number
        ]
    ): void

    public cast(
        owner: Player,
        abilityTypeId: AbilityTypeId,
        levelOrAbilityConsumerOrX: number | ((ability: UnitAbility) => void),
        xOrY: number,
        y?: number
    ): void {
        if (y == undefined) {
            y = xOrY
            xOrY = levelOrAbilityConsumerOrX as number
            levelOrAbilityConsumerOrX = 1
        }
        this.prepare(owner, abilityTypeId, levelOrAbilityConsumerOrX)
        const dummy = this.dummy
        SetUnitX(dummy, xOrY)
        SetUnitY(dummy, y)
        IssueImmediateOrderById(dummy, getOrderIdByAbilityTypeId(abilityTypeId))
        this.finish(abilityTypeId)
    }
}
