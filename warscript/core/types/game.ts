import { Player } from "./player"

const getFloatGameState = GetFloatGameState
const setFloatGameState = SetFloatGameState
const endGame = EndGame

let isSinglePlayer = true
for (const player of Player.all) {
    if (player.isUser && player.isPlaying) {
        isSinglePlayer = false
        break
    }
}

export class Game {
    private constructor() {
        // should not be instantiated
    }

    public static readonly isSinglePlayer = isSinglePlayer

    public static get timeOfDay(): number {
        return getFloatGameState(GAME_STATE_TIME_OF_DAY)
    }

    public static set timeOfDay(v: number) {
        setFloatGameState(GAME_STATE_TIME_OF_DAY, v)
    }

    public static end(doScoreScreen = true): void {
        endGame(doScoreScreen)
    }
}
