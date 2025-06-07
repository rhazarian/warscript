export const enum AnimationName {
    ATTACK = "attack",
    BIRTH = "birth",
    DEATH = "death",
    DECAY = "decay",
    DISSIPATE = "dissipate",
    MORPH = "morph",
    PORTRAIT = "portrait",
    SLEEP = "sleep",
    SPELL = "spell",
    STAND = "stand",
    WALK = "walk",
}

const animationNames: Record<AnimationName, true> = {
    [AnimationName.ATTACK]: true,
    [AnimationName.BIRTH]: true,
    [AnimationName.DEATH]: true,
    [AnimationName.DECAY]: true,
    [AnimationName.DISSIPATE]: true,
    [AnimationName.MORPH]: true,
    [AnimationName.PORTRAIT]: true,
    [AnimationName.SLEEP]: true,
    [AnimationName.SPELL]: true,
    [AnimationName.STAND]: true,
    [AnimationName.WALK]: true,
}

export const isAnimationName = (value: string): value is AnimationName => {
    return value in animationNames
}
