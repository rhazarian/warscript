import { Handle, HandleDestructor } from "./handle"
import { Color } from "./color"
import { IllegalStateException } from "../../exception"

const byId: Record<number, PlayerColor | null> = {}
const byName: Record<string, PlayerColor | null> = {}

export class PlayerColor extends Handle<jplayercolor> {
    public readonly rgba: Readonly<Color>
    public readonly name: string
    public readonly id: number

    public constructor(handle: jplayercolor) {
        super(handle)
        const id = GetHandleId(handle)
        const data = PlayerColor.data[id]
        if (data != undefined) {
            this.rgba = data.rgba
            this.name = data.name
            byId[id] = this
            byName[data.name] = this
        } else {
            this.rgba = Color.of(0, 0, 0)
            this.name = "black"
        }
        this.id = id
    }

    protected override onDestroy(): HandleDestructor {
        throw new IllegalStateException("PlayerColor instances are not supposed to be destroyed.")
    }

    public get hexCode(): string {
        const code = this.rgba.hexCode
        rawset(this, "hexCode", code)
        return code
    }

    private static readonly data = util.contextFn("playerColor/data", () => {
        const handles = [
            PLAYER_COLOR_RED,
            PLAYER_COLOR_BLUE,
            PLAYER_COLOR_CYAN,
            PLAYER_COLOR_PURPLE,
            PLAYER_COLOR_YELLOW,
            PLAYER_COLOR_ORANGE,
            PLAYER_COLOR_GREEN,
            PLAYER_COLOR_PINK,
            PLAYER_COLOR_LIGHT_GRAY,
            PLAYER_COLOR_LIGHT_BLUE,
            PLAYER_COLOR_AQUA,
            PLAYER_COLOR_BROWN,
            PLAYER_COLOR_MAROON,
            PLAYER_COLOR_NAVY,
            PLAYER_COLOR_TURQUOISE,
            PLAYER_COLOR_VIOLET,
            PLAYER_COLOR_WHEAT,
            PLAYER_COLOR_PEACH,
            PLAYER_COLOR_MINT,
            PLAYER_COLOR_LAVENDER,
            PLAYER_COLOR_COAL,
            PLAYER_COLOR_SNOW,
            PLAYER_COLOR_EMERALD,
            PLAYER_COLOR_PEANUT,
            ConvertPlayerColor(PLAYER_NEUTRAL_AGGRESSIVE),
        ]

        const rgbaColors = [
            Color.of(255, 2, 2),
            Color.of(0, 65, 255),
            Color.of(27, 229, 184),
            Color.of(83, 0, 128),
            Color.of(255, 252, 0),
            Color.of(254, 137, 13),
            Color.of(31, 191, 0),
            Color.of(228, 90, 175),
            Color.of(148, 149, 150),
            Color.of(125, 190, 241),
            Color.of(15, 97, 69),
            Color.of(77, 41, 3),
            Color.of(155, 0, 0),
            Color.of(0, 0, 195),
            Color.of(0, 234, 255),
            Color.of(190, 0, 254),
            Color.of(235, 205, 135),
            Color.of(248, 164, 139),
            Color.of(191, 255, 128),
            Color.of(220, 185, 235),
            Color.of(40, 40, 40),
            Color.of(235, 240, 255),
            Color.of(0, 120, 30),
            Color.of(164, 111, 51),
            Color.of(0, 0, 0),
        ]

        const names = [
            "red",
            "blue",
            "teal",
            "purple",
            "yellow",
            "orange",
            "green",
            "pink",
            "gray",
            "light blue",
            "dark green",
            "brown",
            "maroon",
            "navy",
            "turquoise",
            "violet",
            "wheat",
            "peach",
            "mint",
            "lavender",
            "coal",
            "snow",
            "emerald",
            "peanut",
            "black",
        ]

        const data: Record<number, { rgba: Color; name: string }> = {}
        for (let i = 0; i < handles.length; ++i) {
            data[GetHandleId(handles[i])] = {
                rgba: rgbaColors[i],
                name: names[i],
            }
        }
        return data
    })

    public static readonly red = PlayerColor.of(PLAYER_COLOR_RED)
    public static readonly blue = PlayerColor.of(PLAYER_COLOR_BLUE)
    public static readonly teal = PlayerColor.of(PLAYER_COLOR_CYAN)
    public static readonly purple = PlayerColor.of(PLAYER_COLOR_PURPLE)
    public static readonly yellow = PlayerColor.of(PLAYER_COLOR_YELLOW)
    public static readonly orange = PlayerColor.of(PLAYER_COLOR_ORANGE)
    public static readonly green = PlayerColor.of(PLAYER_COLOR_GREEN)
    public static readonly pink = PlayerColor.of(PLAYER_COLOR_PINK)
    public static readonly gray = PlayerColor.of(PLAYER_COLOR_LIGHT_GRAY)
    public static readonly lightBlue = PlayerColor.of(PLAYER_COLOR_LIGHT_BLUE)
    public static readonly darkGreen = PlayerColor.of(PLAYER_COLOR_AQUA)
    public static readonly brown = PlayerColor.of(PLAYER_COLOR_BROWN)
    public static readonly maroon = PlayerColor.of(PLAYER_COLOR_MAROON)
    public static readonly navy = PlayerColor.of(PLAYER_COLOR_NAVY)
    public static readonly turquoise = PlayerColor.of(PLAYER_COLOR_TURQUOISE)
    public static readonly violet = PlayerColor.of(PLAYER_COLOR_VIOLET)
    public static readonly wheat = PlayerColor.of(PLAYER_COLOR_WHEAT)
    public static readonly peach = PlayerColor.of(PLAYER_COLOR_PEACH)
    public static readonly mint = PlayerColor.of(PLAYER_COLOR_MINT)
    public static readonly lavender = PlayerColor.of(PLAYER_COLOR_LAVENDER)
    public static readonly coal = PlayerColor.of(PLAYER_COLOR_COAL)
    public static readonly snow = PlayerColor.of(PLAYER_COLOR_SNOW)
    public static readonly emerald = PlayerColor.of(PLAYER_COLOR_EMERALD)
    public static readonly peanut = PlayerColor.of(PLAYER_COLOR_PEANUT)
    public static readonly black = PlayerColor.of(ConvertPlayerColor(PLAYER_NEUTRAL_AGGRESSIVE))

    public static readonly all = [
        PlayerColor.red,
        PlayerColor.blue,
        PlayerColor.teal,
        PlayerColor.purple,
        PlayerColor.yellow,
        PlayerColor.orange,
        PlayerColor.green,
        PlayerColor.pink,
        PlayerColor.gray,
        PlayerColor.lightBlue,
        PlayerColor.darkGreen,
        PlayerColor.brown,
        PlayerColor.maroon,
        PlayerColor.navy,
        PlayerColor.turquoise,
        PlayerColor.violet,
        PlayerColor.wheat,
        PlayerColor.peach,
        PlayerColor.mint,
        PlayerColor.lavender,
        PlayerColor.coal,
        PlayerColor.snow,
        PlayerColor.emerald,
        PlayerColor.peanut,
        PlayerColor.black,
    ]

    public static byName(name: string): PlayerColor | null {
        return byName[name.toLowerCase()]
    }

    public static byId(id: number): PlayerColor | null {
        return byId[id]
    }
}
