import { UnitBehavior } from "../unit"
import { Unit } from "../../unit"
import { BuffTypeId } from "../../object-data/entry/buff-type"
import { AbilityType } from "../../object-data/entry/ability-type"
import { distinct, flatMap, map } from "../../../utility/arrays"
import { TextTag, TextTagPreset } from "../../text-tag"
import { Destructor } from "../../../destroyable"
import { Timer } from "../../../core/types/timer"
import { BehaviorPriority } from "../../behavior"

const DEFAULT_BUFF_TYPE_IDS = postcompile(() => {
    return distinct(
        flatMap(
            AbilityType.getAllByBaseIds(
                map(
                    [
                        "AHtb",
                        "AHbh",
                        "AOws",
                        "AOw2",
                        "AUim",
                        "Acyc",
                        "ANfb",
                        "ANsb",
                        "ANcs",
                        "ANc1",
                        "ANc2",
                        "ANc3",
                        "ACbh",
                        "ANbh",
                        "SCc1",
                        "ACcy",
                        "ANb2",
                        "Awrs",
                        "Awrh",
                        "Awrg",
                        "ACtb",
                        "ACcb",
                    ],
                    fourCC,
                ),
            ),
            (abilityType) => abilityType.buffTypeIds.flat(),
        ),
    )
})

const process = (behavior: StunImmunityUnitBehavior): void => {
    let hasRemovedBuffs = false
    for (const buffTypeId of behavior.parameters.buffTypeIds ?? DEFAULT_BUFF_TYPE_IDS) {
        hasRemovedBuffs = hasRemovedBuffs || behavior.unit.removeBuff(buffTypeId)
    }
    if (hasRemovedBuffs) {
        behavior["onEffect"]()
        if (behavior.parameters.textTagText != undefined) {
            TextTag.flash(
                TextTag.MISS,
                behavior.parameters.textTagText,
                behavior.unit.x,
                behavior.unit.y,
            )
        }
        behavior.parameters.additionalAction?.(behavior.unit)
    }
}

export type StunImmunityUnitBehaviorParameters = {
    readonly priority?: BehaviorPriority
    buffTypeIds?: readonly BuffTypeId[]
    textTagPreset?: TextTagPreset
    textTagText?: string
    additionalAction?: (this: void, unit: Unit) => void
}

export class StunImmunityUnitBehavior extends UnitBehavior {
    public static defaultParameters: StunImmunityUnitBehaviorParameters = {
        buffTypeIds: DEFAULT_BUFF_TYPE_IDS,
        textTagPreset: TextTag.MISS,
        textTagText: undefined,
    }

    public constructor(
        unit: Unit,
        public readonly parameters: Readonly<StunImmunityUnitBehaviorParameters> = StunImmunityUnitBehavior.defaultParameters,
    ) {
        super(unit, parameters.priority)
        unit.decrementStunCounter()
        process(this)
    }

    protected override onDestroy(): Destructor {
        this.unit.incrementStunCounter()
        return super.onDestroy()
    }

    public override onDamageReceived(): void {
        process(this)
        Timer.run(process, this)
    }

    public override onTargetingAbilityChannelingStart(): void {
        process(this)
    }

    public override onTargetingAbilityImpact(): void {
        process(this)
    }

    protected onEffect(): void {
        // no-op
    }
}
