import {
    UnitClassificationsField,
    UnitFloatField,
    UnitFlyHeightField,
    UnitHealthRegenerationTypeField, UnitIntegerField,
    UnitPropulsionWindowField,
    UnitScalingValueField
} from "../../object-field/unit"

export const PROPULSION_WINDOW_UNIT_FIELD = UnitPropulsionWindowField.create(fourCC("urpw"))

export const CLASSIFICATIONS_UNIT_FIELD = UnitClassificationsField.create(fourCC("utyp"))

export const FLY_HEIGHT_UNIT_FIELD = UnitFlyHeightField.create(fourCC("ufyh"))

export const SCALING_VALUE_UNIT_FIELD = UnitScalingValueField.create(fourCC("usca"))

export const HEALTH_REGENERATION_RATE_UNIT_FIELD = UnitFloatField.create(fourCC("uhpr"))

export const MANA_REGENERATION_RATE_UNIT_FIELD = UnitFloatField.create(fourCC("umpr"))

export const HEALTH_REGENERATION_TYPE_UNIT_FIELD = UnitHealthRegenerationTypeField.create(
    fourCC("uhrt"),
)

export const STRENGTH_UNIT_FIELD = UnitIntegerField.create(fourCC("ustc"))

export const AGILITY_UNIT_FIELD = UnitIntegerField.create(fourCC("uagc"))

export const INTELLIGENCE_UNIT_FIELD = UnitIntegerField.create(fourCC("uinc"))
