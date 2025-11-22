import {
    AbilityBooleanField,
    AbilityBooleanLevelField,
    AbilityCombatClassificationsLevelField,
    AbilityFloatField,
    AbilityFloatLevelField,
    AbilityIntegerField,
    AbilityIntegerLevelField,
    AbilityLightningTypeIdArrayField,
    AbilityStringArrayField,
    AbilityStringField,
    AbilityStringLevelField,
} from "../../object-field/ability"

export const BUTTON_POSITION_NORMAL_X_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(
    fourCC("abpx"),
)

export const BUTTON_POSITION_NORMAL_Y_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(
    fourCC("abpy"),
)

export const BUTTON_POSITION_ACTIVATED_X_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(
    fourCC("aubx"),
)

export const BUTTON_POSITION_ACTIVATED_Y_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(
    fourCC("auby"),
)

export const BUTTON_POSITION_RESEARCH_X_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(
    fourCC("arpx"),
)

export const BUTTON_POSITION_RESEARCH_Y_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(
    fourCC("arpy"),
)

export const MISSILE_SPEED_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(fourCC("amsp"))

export const TARGET_ATTACHMENTS_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(fourCC("atac"))

export const CASTER_ATTACHMENTS_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(fourCC("acac"))

export const PRIORITY_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(fourCC("apri"))

export const LEVELS_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(fourCC("alev"))

export const REQUIRED_LEVEL_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(fourCC("arlv"))

export const LEVEL_SKIP_REQUIREMENT_ABILITY_INTEGER_FIELD = AbilityIntegerField.create(
    fourCC("alsk"),
)

export const HERO_ABILITY_ABILITY_BOOLEAN_FIELD = AbilityBooleanField.create(fourCC("aher"))

// Get only
export const ITEM_ABILITY_ABILITY_BOOLEAN_FIELD = AbilityBooleanField.create(fourCC("aite"))

export const CHECK_DEPENDENCIES_ABILITY_BOOLEAN_FIELD = AbilityBooleanField.create(fourCC("achd"))

export const MISSILE_ARC_ABILITY_FLOAT_FIELD = AbilityFloatField.create(fourCC("amac"))

export const NAME_ABILITY_STRING_FIELD = AbilityStringField.create(fourCC("anam"))

// Get Only
export const ICON_ACTIVATED_ABILITY_STRING_FIELD = AbilityStringField.create(fourCC("auar"))

export const ICON_RESEARCH_ABILITY_STRING_FIELD = AbilityStringField.create(fourCC("arar"))

export const EFFECT_SOUND_ABILITY_STRING_FIELD = AbilityStringField.create(fourCC("aefs"))

export const EFFECT_SOUND_LOOPING_ABILITY_STRING_FIELD = AbilityStringField.create(fourCC("aefl"))

export const MANA_COST_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(fourCC("amcs"))

export const ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD =
    AbilityCombatClassificationsLevelField.create(fourCC("atar"))

export const NUMBER_OF_WAVES_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Hbz1"),
)

export const NUMBER_OF_SHARDS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Hbz3"),
)

export const NUMBER_OF_UNITS_TELEPORTED_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Hmt1"))

export const SUMMONED_UNIT_COUNT_HWE2_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Hwe2"),
)

export const NUMBER_OF_IMAGES_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Omi1"),
)

export const NUMBER_OF_CORPSES_RAISED_UAN1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Uan1"))

export const MORPHING_FLAGS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Eme2"),
)

export const STRENGTH_BONUS_NRG5_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nrg5"),
)

export const DEFENSE_BONUS_NRG6_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nrg6"),
)

export const NUMBER_OF_TARGETS_HIT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ocl2"),
)

export const DETECTION_TYPE_OFS1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ofs1"),
)

export const NUMBER_OF_SUMMONED_UNITS_OSF2_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Osf2"))

export const NUMBER_OF_SUMMONED_UNITS_EFN1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Efn1"))

export const NUMBER_OF_CORPSES_RAISED_HRE1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Hre1"))

export const STACK_FLAGS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Hca4"),
)

export const MINIMUM_NUMBER_OF_UNITS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ndp2"),
)

export const MAXIMUM_NUMBER_OF_UNITS_NDP3_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Ndp3"))

export const NUMBER_OF_UNITS_CREATED_NRC2_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Nrc2"))

export const SHIELD_LIFE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ams3"),
)

export const MANA_LOSS_AMS4_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ams4"),
)

export const GOLD_PER_INTERVAL_BGM1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Bgm1"),
)

export const MAX_NUMBER_OF_MINERS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Bgm3"),
)

export const CARGO_CAPACITY_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Car1"),
)

export const MAXIMUM_CREEP_LEVEL_DEV3_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Dev3"),
)

export const MAX_CREEP_LEVEL_DEV1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Dev1"),
)

export const GOLD_PER_INTERVAL_EGM1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Egm1"),
)

export const DEFENSE_REDUCTION_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Fae1"),
)

export const DETECTION_TYPE_FLA1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Fla1"),
)

export const FLARE_COUNT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Fla3"),
)

export const MAX_GOLD_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(fourCC("Gld1"))

export const MINING_CAPACITY_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Gld3"),
)

export const MAXIMUM_NUMBER_OF_CORPSES_GYD1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Gyd1"))

export const DAMAGE_TO_TREE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Har1"),
)

export const LUMBER_CAPACITY_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Har2"),
)

export const GOLD_CAPACITY_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Har3"),
)

export const DEFENSE_INCREASE_INF2_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Inf2"),
)

export const INTERACTION_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Neu2"),
)

export const GOLD_COST_NDT1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ndt1"),
)

export const LUMBER_COST_NDT2_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ndt2"),
)

export const DETECTION_TYPE_NDT3_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ndt3"),
)

export const STACKING_TYPE_POI4_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Poi4"),
)

export const STACKING_TYPE_POA5_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Poa5"),
)

export const MAXIMUM_CREEP_LEVEL_PLY1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ply1"),
)

export const MAXIMUM_CREEP_LEVEL_POS1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Pos1"),
)

export const MOVEMENT_UPDATE_FREQUENCY_PRG1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Prg1"))

export const ATTACK_UPDATE_FREQUENCY_PRG2_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Prg2"))

export const MANA_LOSS_PRG6_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Prg6"),
)

export const UNITS_SUMMONED_TYPE_ONE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Rai1"),
)

export const UNITS_SUMMONED_TYPE_TWO_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Rai2"),
)

export const MAX_UNITS_SUMMONED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ucb5"),
)

export const ALLOW_WHEN_FULL_REJ3_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Rej3"),
)

export const MAXIMUM_UNITS_CHARGED_TO_CASTER_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Rpb5"))

export const MAXIMUM_UNITS_AFFECTED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Rpb6"),
)

export const DEFENSE_INCREASE_ROA2_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Roa2"),
)

export const MAX_UNITS_ROA7_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Roa7"),
)

export const ROOTED_WEAPONS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Roo1"),
)

export const UPROOTED_WEAPONS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Roo2"),
)

export const UPROOTED_DEFENSE_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Roo4"),
)

export const ACCUMULATION_STEP_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Sal2"),
)

export const NUMBER_OF_OWLS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Esn4"),
)

export const STACKING_TYPE_SPO4_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Spo4"),
)

export const NUMBER_OF_UNITS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Sod1"),
)

export const SPIDER_CAPACITY_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Spa1"),
)

export const INTERVALS_BEFORE_CHANGING_TREES_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Wha2"))

export const AGILITY_BONUS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Iagi"),
)

export const INTELLIGENCE_BONUS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Iint"),
)

export const STRENGTH_BONUS_ISTR_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Istr"),
)

export const ATTACK_BONUS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Iatt"),
)

export const DEFENSE_BONUS_IDEF_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Idef"),
)

export const SUMMON_1_AMOUNT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Isn1"),
)

export const SUMMON_2_AMOUNT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Isn2"),
)

export const EXPERIENCE_GAINED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ixpg"),
)

export const HIT_POINTS_GAINED_IHPG_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ihpg"),
)

export const MANA_POINTS_GAINED_IMPG_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Impg"),
)

export const HIT_POINTS_GAINED_IHP2_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ihp2"),
)

export const MANA_POINTS_GAINED_IMP2_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Imp2"),
)

export const DAMAGE_BONUS_DICE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Idic"),
)

export const ARMOR_PENALTY_IARP_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Iarp"),
)

export const ENABLED_ATTACK_INDEX_IOB5_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Iob5"))

export const LEVELS_GAINED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ilev"),
)

export const MAX_LIFE_GAINED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ilif"),
)

export const MAX_MANA_GAINED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Iman"),
)

export const GOLD_GIVEN_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Igol"),
)

export const LUMBER_GIVEN_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ilum"),
)

export const DETECTION_TYPE_IFA1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ifa1"),
)

export const MAXIMUM_CREEP_LEVEL_ICRE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Icre"),
)

export const MOVEMENT_SPEED_BONUS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Imvb"),
)

export const HIT_POINTS_REGENERATED_PER_SECOND_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Ihpr"))

export const SIGHT_RANGE_BONUS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Isib"),
)

export const DAMAGE_PER_DURATION_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Icfd"),
)

export const MANA_USED_PER_SECOND_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Icfm"),
)

export const EXTRA_MANA_REQUIRED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Icfx"),
)

export const DETECTION_RADIUS_IDET_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Idet"),
)

export const MANA_LOSS_PER_UNIT_IDIM_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Idim"),
)

export const DAMAGE_TO_SUMMONED_UNITS_IDID_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Idid"))

export const MAXIMUM_NUMBER_OF_UNITS_IREC_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Irec"))

export const DELAY_AFTER_DEATH_SECONDS_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Ircd"))

export const RESTORED_LIFE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("irc2"),
)

export const RESTORED_MANA__1_FOR_CURRENT_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("irc3"))

export const HIT_POINTS_RESTORED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ihps"),
)

export const MANA_POINTS_RESTORED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Imps"),
)

export const MAXIMUM_NUMBER_OF_UNITS_ITPM_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Itpm"))

export const NUMBER_OF_CORPSES_RAISED_CAD1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Cad1"))

export const TERRAIN_DEFORMATION_DURATION_MS_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Wrs3"))

export const MAXIMUM_UNITS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Uds1"),
)

export const DETECTION_TYPE_DET1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Det1"),
)

export const GOLD_COST_PER_STRUCTURE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nsp1"),
)

export const LUMBER_COST_PER_USE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nsp2"),
)

export const DETECTION_TYPE_NSP3_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nsp3"),
)

export const NUMBER_OF_SWARM_UNITS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Uls1"),
)

export const MAX_SWARM_UNITS_PER_TARGET_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Uls3"))

export const NUMBER_OF_SUMMONED_UNITS_NBA2_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Nba2"))

export const MAXIMUM_CREEP_LEVEL_NCH1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nch1"),
)

export const ATTACKS_PREVENTED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nsi1"),
)

export const MAXIMUM_NUMBER_OF_TARGETS_EFK3_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Efk3"))

export const NUMBER_OF_SUMMONED_UNITS_ESV1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Esv1"))

export const MAXIMUM_NUMBER_OF_CORPSES_EXH1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("exh1"))

export const ITEM_CAPACITY_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("inv1"),
)

export const MAXIMUM_NUMBER_OF_TARGETS_SPL2_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("spl2"))

export const ALLOW_WHEN_FULL_IRL3_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("irl3"),
)

export const MAXIMUM_DISPELLED_UNITS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("idc3"),
)

export const NUMBER_OF_LURES_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("imo1"),
)

export const NEW_TIME_OF_DAY_HOUR_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("ict1"),
)

export const NEW_TIME_OF_DAY_MINUTE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("ict2"),
)

export const NUMBER_OF_UNITS_CREATED_MEC1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("mec1"))

export const MINIMUM_SPELLS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("spb3"),
)

export const MAXIMUM_SPELLS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("spb4"),
)

export const DISABLED_ATTACK_INDEX_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("gra3"),
)

export const ENABLED_ATTACK_INDEX_GRA4_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("gra4"))

export const MAXIMUM_ATTACKS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("gra5"),
)

export const BUILDING_TYPES_ALLOWED_NPR1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Npr1"))

export const BUILDING_TYPES_ALLOWED_NSA1_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Nsa1"))

export const ATTACK_MODIFICATION_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Iaa1"),
)

export const SUMMONED_UNIT_COUNT_NPA5_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Npa5"),
)

export const UPGRADE_LEVELS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Igl1"),
)

export const NUMBER_OF_SUMMONED_UNITS_NDO2_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Ndo2"))

export const BEASTS_PER_SECOND_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nst1"),
)

export const TARGET_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ncl2"),
)

export const OPTIONS_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(fourCC("Ncl3"))

export const ARMOR_PENALTY_NAB3_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nab3"),
)

export const WAVE_COUNT_NHS6_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nhs6"),
)

export const MAX_CREEP_LEVEL_NTM3_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ntm3"),
)

export const MISSILE_COUNT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ncs3"),
)

export const SPLIT_ATTACK_COUNT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nlm3"),
)

export const GENERATION_COUNT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nlm6"),
)

export const ROCK_RING_COUNT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nvc1"),
)

export const WAVE_COUNT_NVC2_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nvc2"),
)

export const PREFER_HOSTILES_TAU1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Tau1"),
)

export const PREFER_FRIENDLIES_TAU2_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Tau2"),
)

export const MAX_UNITS_TAU3_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Tau3"),
)

export const NUMBER_OF_PULSES_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Tau4"),
)

export const SUMMONED_UNIT_TYPE_HWE1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Hwe1"),
)

export const SUMMONED_UNIT_UIN4_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Uin4"),
)

export const SUMMONED_UNIT_OSF1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Osf1"),
)

export const SUMMONED_UNIT_TYPE_EFNU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Efnu"),
)

export const SUMMONED_UNIT_TYPE_NBAU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nbau"),
)

export const SUMMONED_UNIT_TYPE_NTOU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ntou"),
)

export const SUMMONED_UNIT_TYPE_ESVU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Esvu"),
)

export const SUMMONED_UNIT_TYPES_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nef1"),
)

export const SUMMONED_UNIT_TYPE_NDOU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ndou"),
)

export const ALTERNATE_FORM_UNIT_EMEU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Emeu"),
)

export const PLAGUE_WARD_UNIT_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Aplu"),
)

export const ALLOWED_UNIT_TYPE_BTL1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Btl1"),
)

export const NEW_UNIT_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Cha1"),
)

export const RESULTING_UNIT_TYPE_ENT1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("ent1"),
)

export const CORPSE_UNIT_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Gydu"),
)

export const ALLOWED_UNIT_TYPE_LOA1_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Loa1"),
)

export const UNIT_TYPE_FOR_LIMIT_CHECK_ABILITY_INTEGER_LEVEL_FIELD =
    AbilityIntegerLevelField.create(fourCC("Raiu"))

export const WARD_UNIT_TYPE_STAU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Stau"),
)

export const EFFECT_ABILITY_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Iobu"),
)

export const CONVERSION_UNIT_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ndc2"),
)

export const UNIT_TO_PRESERVE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nsl1"),
)

export const UNIT_TYPE_ALLOWED_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Chl1"),
)

export const SWARM_UNIT_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Ulsu"),
)

export const RESULTING_UNIT_TYPE_COAU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("coau"),
)

export const UNIT_TYPE_EXHU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("exhu"),
)

export const WARD_UNIT_TYPE_HWDU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("hwdu"),
)

export const LURE_UNIT_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("imou"),
)

export const UNIT_TYPE_IPMU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("ipmu"),
)

export const FACTORY_UNIT_ID_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nsyu"),
)

export const SPAWN_UNIT_ID_NFYU_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nfyu"),
)

export const DESTRUCTIBLE_ID_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Nvcu"),
)

export const UPGRADE_TYPE_ABILITY_INTEGER_LEVEL_FIELD = AbilityIntegerLevelField.create(
    fourCC("Iglu"),
)
export const CASTING_TIME_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("acas"))

export const DURATION_NORMAL_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("adur"),
)

export const DURATION_HERO_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("ahdu"))

export const COOLDOWN_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("acdn"))

export const AREA_OF_EFFECT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("aare"),
)

export const CAST_RANGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("aran"))

export const DAMAGE_HBZ2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Hbz2"))

export const BUILDING_REDUCTION_HBZ4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hbz4"),
)

export const DAMAGE_PER_SECOND_HBZ5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hbz5"),
)

export const MAXIMUM_DAMAGE_PER_WAVE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hbz6"),
)

export const MANA_REGENERATION_INCREASE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hab1"),
)

export const CASTING_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Hmt2"))

export const DAMAGE_PER_SECOND_OWW1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Oww1"),
)

export const MAGIC_DAMAGE_REDUCTION_OWW2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Oww2"),
)

export const CHANCE_TO_CRITICAL_STRIKE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ocr1"),
)

export const DAMAGE_MULTIPLIER_OCR2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ocr2"),
)

export const DAMAGE_BONUS_OCR3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ocr3"),
)

export const CHANCE_TO_EVADE_OCR4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ocr4"),
)

export const DAMAGE_DEALT_PERCENT_OMI2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Omi2"),
)

export const DAMAGE_TAKEN_PERCENT_OMI3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Omi3"),
)

export const ANIMATION_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Omi4"),
)

export const TRANSITION_TIME_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Owk1"),
)

export const MOVEMENT_SPEED_INCREASE_PERCENT_OWK2_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Owk2"))

export const BACKSTAB_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Owk3"),
)

export const AMOUNT_HEALED_DAMAGED_UDC1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Udc1"),
)

export const LIFE_CONVERTED_TO_MANA_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Udp1"),
)

export const LIFE_CONVERTED_TO_LIFE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Udp2"),
)

export const MOVEMENT_SPEED_INCREASE_PERCENT_UAU1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Uau1"))

export const LIFE_REGENERATION_INCREASE_PERCENT_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Uau2"))

export const CHANCE_TO_EVADE_EEV1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eev1"),
)

export const DAMAGE_PER_INTERVAL_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eim1"),
)

export const MANA_DRAINED_PER_SECOND_EIM2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eim2"),
)

export const BUFFER_MANA_REQUIRED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eim3"),
)

export const MAX_MANA_DRAINED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Emb1"),
)

export const BOLT_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Emb2"))

export const BOLT_LIFETIME_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Emb3"))

export const ALTITUDE_ADJUSTMENT_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eme3"),
)

export const LANDING_DELAY_TIME_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eme4"),
)

export const ALTERNATE_FORM_HIT_POINT_BONUS_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Eme5"))

export const MOVE_SPEED_BONUS_INFO_PANEL_ONLY_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Ncr5"))

export const ATTACK_SPEED_BONUS_INFO_PANEL_ONLY_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Ncr6"))

export const LIFE_REGENERATION_RATE_PER_SECOND_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("ave5"))

export const STUN_DURATION_USL1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Usl1"),
)

export const ATTACK_DAMAGE_STOLEN_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uav1"),
)

export const DAMAGE_UCS1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Ucs1"))

export const MAX_DAMAGE_UCS2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ucs2"),
)

export const DISTANCE_UCS3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Ucs3"))

export const FINAL_AREA_UCS4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ucs4"),
)

export const DAMAGE_UIN1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Uin1"))

export const DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Uin2"))

export const IMPACT_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Uin3"))

export const DAMAGE_PER_TARGET_OCL1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ocl1"),
)

export const DAMAGE_REDUCTION_PER_TARGET_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ocl3"),
)

export const EFFECT_DELAY_OEQ1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Oeq1"),
)

export const DAMAGE_PER_SECOND_TO_BUILDINGS_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Oeq2"))

export const UNITS_SLOWED_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Oeq3"),
)

export const FINAL_AREA_OEQ4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Oeq4"),
)

export const DAMAGE_PER_SECOND_EER1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eer1"),
)

export const DAMAGE_DEALT_TO_ATTACKERS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eah1"),
)

export const LIFE_HEALED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Etq1"))

export const HEAL_INTERVAL_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Etq2"))

export const BUILDING_REDUCTION_ETQ3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Etq3"),
)

export const INITIAL_IMMUNITY_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Etq4"),
)

export const MAX_LIFE_DRAINED_PER_SECOND_PERCENT_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Udd1"))

export const BUILDING_REDUCTION_UDD2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Udd2"),
)

export const ARMOR_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ufa1"),
)

export const ARMOR_BONUS_UFA2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ufa2"),
)

export const AREA_OF_EFFECT_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ufn1"),
)

export const SPECIFIC_TARGET_DAMAGE_UFN2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ufn2"),
)

export const DAMAGE_BONUS_HFA1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hfa1"),
)

export const DAMAGE_DEALT_ESF1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esf1"),
)

export const DAMAGE_INTERVAL_ESF2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esf2"),
)

export const BUILDING_REDUCTION_ESF3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esf3"),
)

export const DAMAGE_BONUS_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ear1"),
)

export const DEFENSE_BONUS_HAV1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hav1"),
)

export const HIT_POINT_BONUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hav2"),
)

export const DAMAGE_BONUS_HAV3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hav3"),
)

export const MAGIC_DAMAGE_REDUCTION_HAV4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hav4"),
)

export const CHANCE_TO_BASH_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hbh1"),
)

export const DAMAGE_MULTIPLIER_HBH2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hbh2"),
)

export const DAMAGE_BONUS_HBH3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hbh3"),
)

export const CHANCE_TO_MISS_HBH4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hbh4"),
)

export const DAMAGE_HTB1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Htb1"))

export const AOE_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Htc1"))

export const SPECIFIC_TARGET_DAMAGE_HTC2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Htc2"),
)

export const MOVEMENT_SPEED_REDUCTION_PERCENT_HTC3_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Htc3"))

export const ATTACK_SPEED_REDUCTION_PERCENT_HTC4_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Htc4"))

export const ARMOR_BONUS_HAD1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Had1"),
)

export const AMOUNT_HEALED_DAMAGED_HHB1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hhb1"),
)

export const EXTRA_DAMAGE_HCA1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hca1"),
)

export const MOVEMENT_SPEED_FACTOR_HCA2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hca2"),
)

export const ATTACK_SPEED_FACTOR_HCA3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hca3"),
)

export const MOVEMENT_SPEED_INCREASE_PERCENT_OAE1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Oae1"))

export const ATTACK_SPEED_INCREASE_PERCENT_OAE2_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Oae2"))

export const REINCARNATION_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ore1"),
)

export const DAMAGE_OSH1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Osh1"))

export const MAXIMUM_DAMAGE_OSH2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Osh2"),
)

export const DISTANCE_OSH3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Osh3"))

export const FINAL_AREA_OSH4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Osh4"),
)

export const GRAPHIC_DELAY_NFD1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nfd1"),
)

export const GRAPHIC_DURATION_NFD2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nfd2"),
)

export const DAMAGE_NFD3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Nfd3"))

export const SUMMONED_UNIT_DAMAGE_AMS1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ams1"),
)

export const MAGIC_DAMAGE_REDUCTION_AMS2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ams2"),
)

export const AURA_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Apl1"))

export const DAMAGE_PER_SECOND_APL2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Apl2"),
)

export const DURATION_OF_PLAGUE_WARD_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Apl3"),
)

export const AMOUNT_OF_HIT_POINTS_REGENERATED_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Oar1"))

export const ATTACK_DAMAGE_INCREASE_AKB1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Akb1"),
)

export const MANA_LOSS_ADM1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Adm1"),
)

export const SUMMONED_UNIT_DAMAGE_ADM2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Adm2"),
)

export const EXPANSION_AMOUNT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Bli1"),
)

export const INTERVAL_DURATION_BGM2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Bgm2"),
)

export const RADIUS_OF_MINING_RING_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Bgm4"),
)

export const ATTACK_SPEED_INCREASE_PERCENT_BLO1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Blo1"))

export const MOVEMENT_SPEED_INCREASE_PERCENT_BLO2_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Blo2"))

export const SCALING_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Blo3"),
)

export const HIT_POINTS_PER_SECOND_CAN1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Can1"),
)

export const MAX_HIT_POINTS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Can2"),
)

export const DAMAGE_PER_SECOND_DEV2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Dev2"),
)

export const MOVEMENT_UPDATE_FREQUENCY_CHD1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Chd1"))

export const ATTACK_UPDATE_FREQUENCY_CHD2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Chd2"),
)

export const SUMMONED_UNIT_DAMAGE_CHD3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Chd3"),
)

export const MOVEMENT_SPEED_REDUCTION_PERCENT_CRI1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Cri1"))

export const ATTACK_SPEED_REDUCTION_PERCENT_CRI2_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Cri2"))

export const DAMAGE_REDUCTION_CRI3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Cri3"),
)

export const CHANCE_TO_MISS_CRS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Crs1"),
)

export const FULL_DAMAGE_RADIUS_DDA1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Dda1"),
)

export const FULL_DAMAGE_AMOUNT_DDA2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Dda2"),
)

export const PARTIAL_DAMAGE_RADIUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Dda3"),
)

export const PARTIAL_DAMAGE_AMOUNT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Dda4"),
)

export const BUILDING_DAMAGE_FACTOR_SDS1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Sds1"),
)

export const MAX_DAMAGE_UCO5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uco5"),
)

export const MOVE_SPEED_BONUS_UCO6_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uco6"),
)

export const DAMAGE_TAKEN_PERCENT_DEF1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Def1"),
)

export const DAMAGE_DEALT_PERCENT_DEF2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Def2"),
)

export const MOVEMENT_SPEED_FACTOR_DEF3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Def3"),
)

export const ATTACK_SPEED_FACTOR_DEF4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Def4"),
)

export const MAGIC_DAMAGE_REDUCTION_DEF5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Def5"),
)

export const CHANCE_TO_DEFLECT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Def6"),
)

export const DEFLECT_DAMAGE_TAKEN_PIERCING_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Def7"))

export const DEFLECT_DAMAGE_TAKEN_SPELLS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Def8"),
)

export const RIP_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Eat1"))

export const EAT_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Eat2"))

export const HIT_POINTS_GAINED_EAT3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Eat3"),
)

export const AIR_UNIT_LOWER_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ens1"),
)

export const AIR_UNIT_HEIGHT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ens2"),
)

export const MELEE_ATTACK_RANGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ens3"),
)

export const INTERVAL_DURATION_EGM2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Egm2"),
)

export const EFFECT_DELAY_FLA2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Fla2"),
)

export const MINING_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Gld2"),
)

export const RADIUS_OF_GRAVESTONES_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Gyd2"),
)

export const RADIUS_OF_CORPSES_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Gyd3"),
)

export const HIT_POINTS_GAINED_HEA1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hea1"),
)

export const DAMAGE_INCREASE_PERCENT_INF1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Inf1"),
)

export const AUTOCAST_RANGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Inf3"),
)

export const LIFE_REGEN_RATE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Inf4"),
)

export const GRAPHIC_DELAY_LIT1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Lit1"),
)

export const GRAPHIC_DURATION_LIT2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Lit2"),
)

export const DAMAGE_PER_SECOND_LSH1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Lsh1"),
)

export const MANA_GAINED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Mbt1"))

export const HIT_POINTS_GAINED_MBT2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Mbt2"),
)

export const AUTOCAST_REQUIREMENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Mbt3"),
)

export const WATER_HEIGHT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Mbt4"))

export const ACTIVATION_DELAY_MIN1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Min1"),
)

export const INVISIBILITY_TRANSITION_TIME_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Min2"),
)

export const ACTIVATION_RADIUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Neu1"),
)

export const AMOUNT_REGENERATED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Arm1"),
)

export const DAMAGE_PER_SECOND_POI1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Poi1"),
)

export const MOVEMENT_SPEED_FACTOR_POI2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Poi2"),
)

export const ATTACK_SPEED_FACTOR_POI3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Poi3"),
)

export const EXTRA_DAMAGE_POA1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Poa1"),
)

export const DAMAGE_PER_SECOND_POA2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Poa2"),
)

export const ATTACK_SPEED_FACTOR_POA3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Poa3"),
)

export const MOVEMENT_SPEED_FACTOR_POA4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Poa4"),
)

export const DAMAGE_AMPLIFICATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Pos2"),
)

export const CHANCE_TO_STOMP_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("War1"),
)

export const DAMAGE_DEALT_WAR2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("War2"),
)

export const FULL_DAMAGE_RADIUS_WAR3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("War3"),
)

export const HALF_DAMAGE_RADIUS_WAR4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("War4"),
)

export const SUMMONED_UNIT_DAMAGE_PRG3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Prg3"),
)

export const UNIT_PAUSE_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Prg4"),
)

export const HERO_PAUSE_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Prg5"),
)

export const HIT_POINTS_GAINED_REJ1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rej1"),
)

export const MANA_POINTS_GAINED_REJ2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rej2"),
)

export const MINIMUM_LIFE_REQUIRED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rpb3"),
)

export const MINIMUM_MANA_REQUIRED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rpb4"),
)

export const REPAIR_COST_RATIO_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rep1"),
)

export const REPAIR_TIME_RATIO_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rep2"),
)

export const POWERBUILD_COST_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rep3"),
)

export const POWERBUILD_RATE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rep4"),
)

export const NAVAL_RANGE_BONUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Rep5"),
)

export const DAMAGE_INCREASE_PERCENT_ROA1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Roa1"),
)

export const LIFE_REGENERATION_RATE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Roa3"),
)

export const MANA_REGEN_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Roa4"))

export const DAMAGE_INCREASE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nbr1"),
)

export const SALVAGE_COST_RATIO_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Sal1"),
)

export const IN_FLIGHT_SIGHT_RADIUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esn1"),
)

export const HOVERING_SIGHT_RADIUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esn2"),
)

export const HOVERING_HEIGHT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esn3"),
)

export const DURATION_OF_OWLS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esn5"),
)

export const FADE_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Shm1"))

export const DAY_NIGHT_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Shm2"),
)

export const ACTION_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Shm3"),
)

export const MOVEMENT_SPEED_FACTOR_SLO1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Slo1"),
)

export const ATTACK_SPEED_FACTOR_SLO2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Slo2"),
)

export const DAMAGE_PER_SECOND_SPO1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Spo1"),
)

export const MOVEMENT_SPEED_FACTOR_SPO2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Spo2"),
)

export const ATTACK_SPEED_FACTOR_SPO3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Spo3"),
)

export const ACTIVATION_DELAY_STA1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Sta1"),
)

export const DETECTION_RADIUS_STA2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Sta2"),
)

export const DETONATION_RADIUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Sta3"),
)

export const STUN_DURATION_STA4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Sta4"),
)

export const ATTACK_SPEED_BONUS_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uhf1"),
)

export const DAMAGE_PER_SECOND_UHF2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uhf2"),
)

export const LUMBER_PER_INTERVAL_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Wha1"),
)

export const ART_ATTACHMENT_HEIGHT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Wha3"),
)

export const TELEPORT_AREA_WIDTH_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Wrp1"),
)

export const TELEPORT_AREA_HEIGHT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Wrp2"),
)

export const LIFE_STOLEN_PER_ATTACK_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ivam"),
)

export const DAMAGE_BONUS_IDAM_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Idam"),
)

export const CHANCE_TO_HIT_UNITS_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Iob2"),
)

export const CHANCE_TO_HIT_HEROES_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Iob3"),
)

export const CHANCE_TO_HIT_SUMMONS_PERCENT_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Iob4"))

export const DELAY_FOR_TARGET_EFFECT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Idel"),
)

export const DAMAGE_DEALT_PERCENT_OF_NORMAL_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Iild"))

export const DAMAGE_RECEIVED_MULTIPLIER_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Iilw"),
)

export const MANA_REGENERATION_BONUS_AS_FRACTION_OF_NORMAL_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Imrp"))

export const MOVEMENT_SPEED_INCREASE_ISPI_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ispi"),
)

export const DAMAGE_PER_SECOND_IDPS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Idps"),
)

export const ATTACK_DAMAGE_INCREASE_CAC1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Cac1"),
)

export const DAMAGE_PER_SECOND_COR1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Cor1"),
)

export const ATTACK_SPEED_INCREASE_ISX1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Isx1"),
)

export const DAMAGE_WRS1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Wrs1"))

export const TERRAIN_DEFORMATION_AMPLITUDE_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Wrs2"))

export const DAMAGE_CTC1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Ctc1"))

export const EXTRA_DAMAGE_TO_TARGET_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ctc2"),
)

export const MOVEMENT_SPEED_REDUCTION_CTC3_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Ctc3"))

export const ATTACK_SPEED_REDUCTION_CTC4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ctc4"),
)

export const DAMAGE_CTB1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Ctb1"))

export const CASTING_DELAY_SECONDS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uds2"),
)

export const MANA_LOSS_PER_UNIT_DTN1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Dtn1"),
)

export const DAMAGE_TO_SUMMONED_UNITS_DTN2_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Dtn2"))

export const TRANSITION_TIME_SECONDS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ivs1"),
)

export const MANA_DRAINED_PER_SECOND_NMR1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nmr1"),
)

export const CHANCE_TO_REDUCE_DAMAGE_PERCENT_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Ssk1"))

export const MINIMUM_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ssk2"),
)

export const IGNORED_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ssk3"),
)

export const FULL_DAMAGE_DEALT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hfs1"),
)

export const FULL_DAMAGE_INTERVAL_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hfs2"),
)

export const HALF_DAMAGE_DEALT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hfs3"),
)

export const HALF_DAMAGE_INTERVAL_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hfs4"),
)

export const BUILDING_REDUCTION_HFS5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hfs5"),
)

export const MAXIMUM_DAMAGE_HFS6_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Hfs6"),
)

export const MANA_PER_HIT_POINT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nms1"),
)

export const DAMAGE_ABSORBED_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nms2"),
)

export const WAVE_DISTANCE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Uim1"))

export const WAVE_TIME_SECONDS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uim2"),
)

export const DAMAGE_DEALT_UIM3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uim3"),
)

export const AIR_TIME_SECONDS_UIM4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uim4"),
)

export const UNIT_RELEASE_INTERVAL_SECONDS_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Uls2"))

export const DAMAGE_RETURN_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uls4"),
)

export const DAMAGE_RETURN_THRESHOLD_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uls5"),
)

export const RETURNED_DAMAGE_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uts1"),
)

export const RECEIVED_DAMAGE_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uts2"),
)

export const DEFENSE_BONUS_UTS3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Uts3"),
)

export const DAMAGE_BONUS_NBA1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nba1"),
)

export const SUMMONED_UNIT_DURATION_SECONDS_NBA3_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Nba3"))

export const MANA_PER_SUMMONED_HITPOINT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Cmg2"),
)

export const CHARGE_FOR_CURRENT_LIFE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Cmg3"),
)

export const HIT_POINTS_DRAINED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr1"),
)

export const MANA_POINTS_DRAINED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr2"),
)

export const DRAIN_INTERVAL_SECONDS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr3"),
)

export const LIFE_TRANSFERRED_PER_SECOND_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr4"),
)

export const MANA_TRANSFERRED_PER_SECOND_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr5"),
)

export const BONUS_LIFE_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr6"),
)

export const BONUS_LIFE_DECAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr7"),
)

export const BONUS_MANA_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr8"),
)

export const BONUS_MANA_DECAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndr9"),
)

export const CHANCE_TO_MISS_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsi2"),
)

export const MOVEMENT_SPEED_MODIFIER_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsi3"),
)

export const ATTACK_SPEED_MODIFIER_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsi4"),
)

export const DAMAGE_PER_SECOND_TDG1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Tdg1"),
)

export const MEDIUM_DAMAGE_RADIUS_TDG2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Tdg2"),
)

export const MEDIUM_DAMAGE_PER_SECOND_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Tdg3"),
)

export const SMALL_DAMAGE_RADIUS_TDG4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Tdg4"),
)

export const SMALL_DAMAGE_PER_SECOND_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Tdg5"),
)

export const AIR_TIME_SECONDS_TSP1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Tsp1"),
)

export const MINIMUM_HIT_INTERVAL_SECONDS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Tsp2"),
)

export const DAMAGE_PER_SECOND_NBF5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nbf5"),
)

export const MAXIMUM_RANGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Ebl1"))

export const MINIMUM_RANGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Ebl2"))

export const DAMAGE_PER_TARGET_EFK1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Efk1"),
)

export const MAXIMUM_TOTAL_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Efk2"),
)

export const MAXIMUM_SPEED_ADJUSTMENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Efk4"),
)

export const DECAYING_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esh1"),
)

export const MOVEMENT_SPEED_FACTOR_ESH2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esh2"),
)

export const ATTACK_SPEED_FACTOR_ESH3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esh3"),
)

export const DECAY_POWER_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Esh4"))

export const INITIAL_DAMAGE_ESH5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Esh5"),
)

export const MAXIMUM_LIFE_ABSORBED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("abs1"),
)

export const MAXIMUM_MANA_ABSORBED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("abs2"),
)

export const MOVEMENT_SPEED_INCREASE_BSK1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("bsk1"),
)

export const ATTACK_SPEED_INCREASE_BSK2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("bsk2"),
)

export const DAMAGE_TAKEN_INCREASE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("bsk3"),
)

export const LIFE_PER_UNIT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("dvm1"))

export const MANA_PER_UNIT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("dvm2"))

export const LIFE_PER_BUFF_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("dvm3"))

export const MANA_PER_BUFF_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("dvm4"))

export const SUMMONED_UNIT_DAMAGE_DVM5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("dvm5"),
)

export const DAMAGE_BONUS_FAK1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fak1"),
)

export const MEDIUM_DAMAGE_FACTOR_FAK2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fak2"),
)

export const SMALL_DAMAGE_FACTOR_FAK3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fak3"),
)

export const FULL_DAMAGE_RADIUS_FAK4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fak4"),
)

export const HALF_DAMAGE_RADIUS_FAK5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fak5"),
)

export const EXTRA_DAMAGE_PER_SECOND_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("liq1"),
)

export const MOVEMENT_SPEED_REDUCTION_LIQ2_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("liq2"))

export const ATTACK_SPEED_REDUCTION_LIQ3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("liq3"),
)

export const MAGIC_DAMAGE_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("mim1"),
)

export const UNIT_DAMAGE_PER_MANA_POINT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("mfl1"),
)

export const HERO_DAMAGE_PER_MANA_POINT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("mfl2"),
)

export const UNIT_MAXIMUM_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("mfl3"),
)

export const HERO_MAXIMUM_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("mfl4"),
)

export const DAMAGE_COOLDOWN_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("mfl5"),
)

export const DISTRIBUTED_DAMAGE_FACTOR_SPL1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("spl1"))

export const LIFE_REGENERATED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("irl1"),
)

export const MANA_REGENERATED_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("irl2"),
)

export const MANA_LOSS_PER_UNIT_IDC1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("idc1"),
)

export const SUMMONED_UNIT_DAMAGE_IDC2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("idc2"),
)

export const ACTIVATION_DELAY_IMO2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("imo2"),
)

export const LURE_INTERVAL_SECONDS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("imo3"),
)

export const DAMAGE_BONUS_ISR1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("isr1"),
)

export const DAMAGE_REDUCTION_ISR2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("isr2"),
)

export const DAMAGE_BONUS_IPV1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("ipv1"),
)

export const LIFE_STEAL_AMOUNT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("ipv2"),
)

export const LIFE_RESTORED_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("ast1"),
)

export const MANA_RESTORED_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("ast2"),
)

export const ATTACH_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("gra1"))

export const REMOVE_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("gra2"))

export const HERO_REGENERATION_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsa2"),
)

export const UNIT_REGENERATION_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsa3"),
)

export const MAGIC_DAMAGE_REDUCTION_NSA4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsa4"),
)

export const HIT_POINTS_PER_SECOND_NSA5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsa5"),
)

export const DAMAGE_TO_SUMMONED_UNITS_IXS1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Ixs1"))

export const MAGIC_DAMAGE_REDUCTION_IXS2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ixs2"),
)

export const SUMMONED_UNIT_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Npa6"),
)

export const SHIELD_COOLDOWN_TIME_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nse1"),
)

export const DAMAGE_PER_SECOND_NDO1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ndo1"),
)

export const SUMMONED_UNIT_DURATION_SECONDS_NDO3_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Ndo3"))

export const MEDIUM_DAMAGE_RADIUS_FLK1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("flk1"),
)

export const SMALL_DAMAGE_RADIUS_FLK2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("flk2"),
)

export const FULL_DAMAGE_AMOUNT_FLK3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("flk3"),
)

export const MEDIUM_DAMAGE_AMOUNT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("flk4"),
)

export const SMALL_DAMAGE_AMOUNT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("flk5"),
)

export const MOVEMENT_SPEED_REDUCTION_PERCENT_HBN1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Hbn1"))

export const ATTACK_SPEED_REDUCTION_PERCENT_HBN2_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Hbn2"))

export const MAX_MANA_DRAINED_UNITS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fbk1"),
)

export const DAMAGE_RATIO_UNITS_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fbk2"),
)

export const MAX_MANA_DRAINED_HEROS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fbk3"),
)

export const DAMAGE_RATIO_HEROS_PERCENT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fbk4"),
)

export const SUMMONED_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("fbk5"),
)

export const DISTRIBUTED_DAMAGE_FACTOR_NCA1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("nca1"))

export const INITIAL_DAMAGE_PXF1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("pxf1"),
)

export const DAMAGE_PER_SECOND_PXF2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("pxf2"),
)

export const DAMAGE_PER_SECOND_MLS1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("mls1"),
)

export const BEAST_COLLISION_RADIUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nst2"),
)

export const DAMAGE_AMOUNT_NST3_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nst3"),
)

export const DAMAGE_RADIUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Nst4"))

export const DAMAGE_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Nst5"))

export const FOLLOW_THROUGH_TIME_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ncl1"),
)

export const ART_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Ncl4"))

export const MOVEMENT_SPEED_REDUCTION_PERCENT_NAB1_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Nab1"))

export const ATTACK_SPEED_REDUCTION_PERCENT_NAB2_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Nab2"))

export const PRIMARY_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nab4"),
)

export const SECONDARY_DAMAGE_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nab5"),
)

export const DAMAGE_INTERVAL_NAB6_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nab6"),
)

export const GOLD_COST_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ntm1"),
)

export const LUMBER_COST_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ntm2"),
)

export const MOVE_SPEED_BONUS_NEG1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Neg1"),
)

export const DAMAGE_BONUS_NEG2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Neg2"),
)

export const DAMAGE_AMOUNT_NCS1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ncs1"),
)

export const DAMAGE_INTERVAL_NCS2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ncs2"),
)

export const MAX_DAMAGE_NCS4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ncs4"),
)

export const BUILDING_DAMAGE_FACTOR_NCS5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ncs5"),
)

export const EFFECT_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Ncs6"),
)

export const SPAWN_INTERVAL_NSY1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsy1"),
)

export const SPAWN_UNIT_DURATION_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsy3"),
)

export const SPAWN_UNIT_OFFSET_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsy4"),
)

export const LEASH_RANGE_NSY5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nsy5"),
)

export const SPAWN_INTERVAL_NFY1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nfy1"),
)

export const LEASH_RANGE_NFY2_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nfy2"),
)

export const CHANCE_TO_DEMOLISH_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nde1"),
)

export const DAMAGE_MULTIPLIER_BUILDINGS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nde2"),
)

export const DAMAGE_MULTIPLIER_UNITS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nde3"),
)

export const DAMAGE_MULTIPLIER_HEROES_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nde4"),
)

export const BONUS_DAMAGE_MULTIPLIER_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nic1"),
)

export const DEATH_DAMAGE_FULL_AMOUNT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nic2"),
)

export const DEATH_DAMAGE_FULL_AREA_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nic3"),
)

export const DEATH_DAMAGE_HALF_AMOUNT_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nic4"),
)

export const DEATH_DAMAGE_HALF_AREA_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nic5"),
)

export const DEATH_DAMAGE_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nic6"),
)

export const DAMAGE_AMOUNT_NSO1_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nso1"),
)

export const DAMAGE_PERIOD_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Nso2"))

export const DAMAGE_PENALTY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nso3"),
)

export const MOVEMENT_SPEED_REDUCTION_PERCENT_NSO4_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Nso4"))

export const ATTACK_SPEED_REDUCTION_PERCENT_NSO5_ABILITY_FLOAT_LEVEL_FIELD =
    AbilityFloatLevelField.create(fourCC("Nso5"))

export const SPLIT_DELAY_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Nlm2"))

export const MAX_HITPOINT_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nlm4"),
)

export const LIFE_DURATION_SPLIT_BONUS_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nlm5"),
)

export const WAVE_INTERVAL_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(fourCC("Nvc3"))

export const BUILDING_DAMAGE_FACTOR_NVC4_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nvc4"),
)

export const FULL_DAMAGE_AMOUNT_NVC5_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nvc5"),
)

export const HALF_DAMAGE_FACTOR_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Nvc6"),
)

export const INTERVAL_BETWEEN_PULSES_ABILITY_FLOAT_LEVEL_FIELD = AbilityFloatLevelField.create(
    fourCC("Tau5"),
)
export const PERCENT_BONUS_HAB2_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Hab2"),
)

export const USE_TELEPORT_CLUSTERING_HMT3_ABILITY_BOOLEAN_LEVEL_FIELD =
    AbilityBooleanLevelField.create(fourCC("Hmt3"))

export const NEVER_MISS_OCR5_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ocr5"),
)

export const EXCLUDE_ITEM_DAMAGE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ocr6"),
)

export const BACKSTAB_DAMAGE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Owk4"),
)

export const INHERIT_UPGRADES_UAN3_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Uan3"),
)

export const MANA_CONVERSION_AS_PERCENT_ABILITY_BOOLEAN_LEVEL_FIELD =
    AbilityBooleanLevelField.create(fourCC("Udp3"))

export const LIFE_CONVERSION_AS_PERCENT_ABILITY_BOOLEAN_LEVEL_FIELD =
    AbilityBooleanLevelField.create(fourCC("Udp4"))

export const LEAVE_TARGET_ALIVE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Udp5"),
)

export const PERCENT_BONUS_UAU3_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Uau3"),
)

export const DAMAGE_IS_PERCENT_RECEIVED_ABILITY_BOOLEAN_LEVEL_FIELD =
    AbilityBooleanLevelField.create(fourCC("Eah2"))

export const MELEE_BONUS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ear2"),
)

export const RANGED_BONUS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ear3"),
)

export const FLAT_BONUS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ear4"),
)

export const NEVER_MISS_HBH5_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Hbh5"),
)

export const PERCENT_BONUS_HAD2_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Had2"),
)

export const CAN_DEACTIVATE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Hds1"),
)

export const RAISED_UNITS_ARE_INVULNERABLE_ABILITY_BOOLEAN_LEVEL_FIELD =
    AbilityBooleanLevelField.create(fourCC("Hre2"))

export const PERCENTAGE_OAR2_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Oar2"),
)

export const SUMMON_BUSY_UNITS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Btl2"),
)

export const CREATES_BLIGHT_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Bli2"),
)

export const EXPLODES_ON_DEATH_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Sds6"),
)

export const ALWAYS_AUTOCAST_FAE2_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Fae2"),
)

export const REGENERATE_ONLY_AT_NIGHT_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Mbt5"),
)

export const SHOW_SELECT_UNIT_BUTTON_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Neu3"),
)

export const SHOW_UNIT_INDICATOR_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Neu4"),
)

export const CHARGE_OWNING_PLAYER_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ans6"),
)

export const PERCENTAGE_ARM2_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Arm2"),
)

export const TARGET_IS_INVULNERABLE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Pos3"),
)

export const TARGET_IS_MAGIC_IMMUNE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Pos4"),
)

export const KILL_ON_CASTER_DEATH_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ucb6"),
)

export const NO_TARGET_REQUIRED_REJ4_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Rej4"),
)

export const ACCEPTS_GOLD_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Rtn1"),
)

export const ACCEPTS_LUMBER_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Rtn2"),
)

export const PREFER_HOSTILES_ROA5_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Roa5"),
)

export const PREFER_FRIENDLIES_ROA6_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Roa6"),
)

export const ROOTED_TURNING_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Roo3"),
)

export const ALWAYS_AUTOCAST_SLO3_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Slo3"),
)

export const HIDE_BUTTON_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ihid"),
)

export const USE_TELEPORT_CLUSTERING_ITP2_ABILITY_BOOLEAN_LEVEL_FIELD =
    AbilityBooleanLevelField.create(fourCC("Itp2"))

export const IMMUNE_TO_MORPH_EFFECTS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Eth1"),
)

export const DOES_NOT_BLOCK_BUILDINGS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Eth2"),
)

export const AUTO_ACQUIRE_ATTACK_TARGETS_ABILITY_BOOLEAN_LEVEL_FIELD =
    AbilityBooleanLevelField.create(fourCC("Gho1"))

export const IMMUNE_TO_MORPH_EFFECTS_GHO2_ABILITY_BOOLEAN_LEVEL_FIELD =
    AbilityBooleanLevelField.create(fourCC("Gho2"))

export const DO_NOT_BLOCK_BUILDINGS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Gho3"),
)

export const INCLUDE_RANGED_DAMAGE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ssk4"),
)

export const INCLUDE_MELEE_DAMAGE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ssk5"),
)

export const MOVE_TO_PARTNER_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("coa2"),
)

export const CAN_BE_DISPELLED_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("cyc1"),
)

export const IGNORE_FRIENDLY_BUFFS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("dvm6"),
)

export const DROP_ITEMS_ON_DEATH_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("inv2"),
)

export const CAN_USE_ITEMS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("inv3"),
)

export const CAN_GET_ITEMS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("inv4"),
)

export const CAN_DROP_ITEMS_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("inv5"),
)

export const REPAIRS_ALLOWED_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("liq4"),
)

export const CASTER_ONLY_SPLASH_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("mfl6"),
)

export const NO_TARGET_REQUIRED_IRL4_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("irl4"),
)

export const DISPEL_ON_ATTACK_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("irl5"),
)

export const AMOUNT_IS_RAW_VALUE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("ipv3"),
)

export const SHARED_SPELL_COOLDOWN_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("spb2"),
)

export const SLEEP_ONCE_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("sla1"),
)

export const ALLOW_ON_ANY_PLAYER_SLOT_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("sla2"),
)

export const DISABLE_OTHER_ABILITIES_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ncl5"),
)

export const ALLOW_BOUNTY_ABILITY_BOOLEAN_LEVEL_FIELD = AbilityBooleanLevelField.create(
    fourCC("Ntm4"),
)

export const ICON_NORMAL_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(fourCC("aart"))

export const CASTER_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD = AbilityStringArrayField.create(
    fourCC("acat"),
)

export const CASTER_EFFECT_FIRST_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("acap"),
)

export const CASTER_EFFECT_SECOND_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("aca1"),
)

export const TARGET_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD = AbilityStringArrayField.create(
    fourCC("atat"),
)

export const TARGET_EFFECT_FIRST_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("ata0"),
)

export const TARGET_EFFECT_SECOND_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("ata1"),
)

export const TARGET_EFFECT_THIRD_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("ata2"),
)

export const TARGET_EFFECT_FOURTH_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("ata3"),
)

export const TARGET_EFFECT_FIFTH_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("ata4"),
)

export const TARGET_EFFECT_SIXTH_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("ata5"),
)

export const SPECIAL_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD = AbilityStringArrayField.create(
    fourCC("asat"),
)

export const SPECIAL_EFFECT_ATTACHMENT_POINT_STRING_FIELD = AbilityStringField.create(
    fourCC("aspt"),
)

export const EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD = AbilityStringArrayField.create(
    fourCC("aeat"),
)

export const AREA_EFFECT_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD = AbilityStringArrayField.create(
    fourCC("aaea"),
)

export const LIGHTNING_EFFECTS_ABILITY_LIGHTNING_TYPE_ID_ARRAY_FIELD =
    AbilityLightningTypeIdArrayField.create(fourCC("alig"))

export const MISSILE_MODEL_PATHS_ABILITY_STRING_ARRAY_FIELD = AbilityStringArrayField.create(
    fourCC("amat"),
)

export const TOOLTIP_LEARN_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("aret"),
)

export const TOOLTIP_LEARN_EXTENDED_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("arut"),
)

export const TOOLTIP_NORMAL_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("atp1"),
)

export const TOOLTIP_TURN_OFF_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("aut1"),
)

export const TOOLTIP_NORMAL_EXTENDED_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("aub1"),
)

export const TOOLTIP_TURN_OFF_EXTENDED_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("auu1"),
)

export const NORMAL_FORM_UNIT_EME1_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Eme1"),
)

export const SPAWNED_UNITS_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ndp1"),
)

export const ABILITY_FOR_UNIT_CREATION_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Nrc1"),
)

export const NORMAL_FORM_UNIT_MIL1_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Mil1"),
)

export const ALTERNATE_FORM_UNIT_MIL2_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Mil2"),
)

export const BASE_ORDER_ID_ANS5_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ans5"),
)

export const MORPH_UNITS_GROUND_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ply2"),
)

export const MORPH_UNITS_AIR_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ply3"),
)

export const MORPH_UNITS_AMPHIBIOUS_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ply4"),
)

export const MORPH_UNITS_WATER_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ply5"),
)

export const UNIT_TYPE_ONE_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Rai3"),
)

export const UNIT_TYPE_TWO_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Rai4"),
)

export const UNIT_TYPE_SOD2_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Sod2"),
)

export const SUMMON_1_UNIT_TYPE_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ist1"),
)

export const SUMMON_2_UNIT_TYPE_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ist2"),
)

export const RACE_TO_CONVERT_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ndc1"),
)

export const PARTNER_UNIT_TYPE_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("coa1"),
)

export const PARTNER_UNIT_TYPE_ONE_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("dcp1"),
)

export const PARTNER_UNIT_TYPE_TWO_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("dcp2"),
)

export const REQUIRED_UNIT_TYPE_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("tpi1"),
)

export const CONVERTED_UNIT_TYPE_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("tpi2"),
)

export const SPELL_LIST_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(fourCC("spb1"))

export const BASE_ORDER_ID_SPB5_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("spb5"),
)

export const BASE_ORDER_ID_NCL6_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Ncl6"),
)

export const ABILITY_UPGRADE_1_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Neg3"),
)

export const ABILITY_UPGRADE_2_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Neg4"),
)

export const ABILITY_UPGRADE_3_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Neg5"),
)

export const ABILITY_UPGRADE_4_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Neg6"),
)

export const SPAWN_UNIT_ID_NSY2_ABILITY_STRING_LEVEL_FIELD = AbilityStringLevelField.create(
    fourCC("Nsy2"),
)
