import {
    UnitClassificationsField, UnitFloatField,
    UnitFlyHeightField,
    UnitHealthRegenerationTypeField,
    UnitPropulsionWindowField,
    UnitScalingValueField
} from "../../object-field/unit"

export const PROPULSION_WINDOW_UNIT_FLOAT_FIELD = UnitPropulsionWindowField.create(fourCC("urpw"))

export const UNIT_CLASSIFICATIONS_FIELD = UnitClassificationsField.create(fourCC("utyp"))

export const FLY_HEIGHT_UNIT_FLOAT_FIELD = UnitFlyHeightField.create(fourCC("ufyh"))

export const SCALING_VALUE_UNIT_FLOAT_FIELD = UnitScalingValueField.create(fourCC("usca"))

export const HEALTH_REGENERATION_RATE_UNIT_FLOAT_FIELD = UnitFloatField.create(fourCC("uhpr"))

export const MANA_REGENERATION_RATE_UNIT_FLOAT_FIELD = UnitFloatField.create(fourCC("umpr"))

export const UNIT_HEALTH_REGENERATION_TYPE_FIELD = UnitHealthRegenerationTypeField.create(
    fourCC("uhrt"),
)
