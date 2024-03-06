import { BinaryReader } from "../binaryreader"
import { BinaryWriter } from "../binarywriter"
import { StringBuilder } from "../util/stringBuilder"

const date = os.date
const pack = string.pack

const cache: Record<string, LocalTime | undefined> = setmetatable({}, { __mode: "v" })

export class LocalTime {
    /**
     * The minimum supported {@code LocalTime}, '00:00'.
     * This is the time of midnight at the start of the day.
     */
    public static readonly MIN = LocalTime.of(0, 0, 0)
    /**
     * The maximum supported {@code LocalTime}, '23:59:59'.
     * This is the time just before midnight at the end of the day.
     */
    public static readonly MAX = LocalTime.of(23, 59, 59)
    /**
     * The time of midnight at the start of the day, '00:00'.
     */
    public static readonly MIDNIGHT = LocalTime.of(0, 0, 0)
    /**
     * The time of noon in the middle of the day, '12:00'.
     */
    public static readonly NOON = LocalTime.of(12, 0, 0)

    /**
     * Hours per day.
     */
    public static readonly HOURS_PER_DAY = 24
    /**
     * Minutes per hour.
     */
    public static readonly MINUTES_PER_HOUR = 60
    /**
     * Minutes per day.
     */
    public static readonly MINUTES_PER_DAY = LocalTime.MINUTES_PER_HOUR * LocalTime.HOURS_PER_DAY
    /**
     * Seconds per minute.
     */
    public static readonly SECONDS_PER_MINUTE = 60
    /**
     * Seconds per hour.
     */
    public static readonly SECONDS_PER_HOUR =
        LocalTime.SECONDS_PER_MINUTE * LocalTime.MINUTES_PER_HOUR
    /**
     * Seconds per day.
     */
    public static readonly SECONDS_PER_DAY = LocalTime.SECONDS_PER_HOUR * LocalTime.HOURS_PER_DAY

    private constructor(
        public readonly hour: number,
        public readonly minute: number,
        public readonly second: number,
        private readonly key: string
    ) {
        assert(math.type(hour) == "integer" && hour >= 0 && hour <= 23)
        assert(math.type(minute) == "integer" && minute >= 0 && minute <= 59)
        assert(math.type(second) == "integer" && second >= 0 && second <= 59)

        cache[key] = this
    }

    /**
     * Obtains the current time from the system clock in the default time-zone.
     *
     * @return the current time using the system clock and default time-zone
     */
    public static now(): LocalTime {
        const info = date("*t")
        return LocalTime.of(info.hour, info.min, info.sec)
    }

    /**
     * Obtains an instance of {@code LocalTime} from an hour, minute and second.
     * <p>
     * This returns a {@code LocalTime} with the specified hour, minute and second.
     *
     * @param hour  the hour-of-day to represent, from 0 to 23
     * @param minute  the minute-of-hour to represent, from 0 to 59
     * @param second  the second-of-minute to represent, from 0 to 59
     * @return the local time
     */
    public static of(hour: number, minute: number, second = 0): LocalTime {
        const key = pack(">BBB", hour, minute, second)
        return cache[key] ?? new LocalTime(hour, minute, second, key)
    }

    public static deserialize(reader: BinaryReader): LocalTime {
        return LocalTime.of(reader.readUInt8(), reader.readUInt8(), reader.readUInt8())
    }

    public serialize(writer: BinaryWriter): void {
        writer.writeBytes(this.key)
    }

    /**
     * Outputs this time as a {@code String}, such as {@code 10:15}.
     * <p>
     * The output will be one of the following ISO-8601 formats:
     * <ul>
     * <li>{@code HH:mm}</li>
     * <li>{@code HH:mm:ss}</li>
     * </ul>
     * The format used will be the shortest that outputs the full value of
     * the time where the omitted parts are implied to be zero.
     *
     * @return a string representation of this time
     */
    public toString(): string {
        const hour = this.hour
        const minute = this.minute
        const second = this.second
        const sb = new StringBuilder()
        sb.append(hour < 10 ? "0" : "")
            .append(hour)
            .append(minute < 10 ? ":0" : ":")
            .append(minute)
        if (second > 0) {
            sb.append(second < 10 ? ":0" : ":").append(second)
        }
        return sb.toString()
    }

    private __lt(other: LocalTime): boolean {
        let cmp = this.hour - other.hour
        if (cmp == 0) {
            cmp = this.minute - other.minute
            if (cmp == 0) {
                cmp = this.second - other.second
            }
        }
        return cmp < 0
    }

    private __le(other: LocalTime): boolean {
        let cmp = this.hour - other.hour
        if (cmp == 0) {
            cmp = this.minute - other.minute
            if (cmp == 0) {
                cmp = this.second - other.second
            }
        }
        return cmp <= 0
    }
}
