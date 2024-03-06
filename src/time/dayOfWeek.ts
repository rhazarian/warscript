import { BinaryReader } from "../binaryreader"
import { BinaryWriter } from "../binarywriter"

const cache: Record<number, DayOfWeek | undefined> = setmetatable({}, { __mode: "v" })

/**
 * A day-of-week, such as 'Tuesday'.
 * <p>
 * {@code DayOfWeek} is a class representing the 7 days of the week -
 * Monday, Tuesday, Wednesday, Thursday, Friday, Saturday and Sunday.
 * <p>
 * This class represents a common concept that is found in many calendar systems.
 * As such, this class may be used by any calendar system that has the day-of-week
 * concept defined exactly equivalent to the ISO calendar system.
 */
export class DayOfWeek {
    /**
     * The singleton instance for the day-of-week of Monday.
     * This has the numeric value of {@code 1}.
     */
    public static readonly MONDAY = DayOfWeek.of(1)
    /**
     * The singleton instance for the day-of-week of Tuesday.
     * This has the numeric value of {@code 2}.
     */
    public static readonly TUESDAY = DayOfWeek.of(2)
    /**
     * The singleton instance for the day-of-week of Wednesday.
     * This has the numeric value of {@code 3}.
     */
    public static readonly WEDNESDAY = DayOfWeek.of(3)
    /**
     * The singleton instance for the day-of-week of Thursday.
     * This has the numeric value of {@code 4}.
     */
    public static readonly THURSDAY = DayOfWeek.of(4)
    /**
     * The singleton instance for the day-of-week of Friday.
     * This has the numeric value of {@code 5}.
     */
    public static readonly FRIDAY = DayOfWeek.of(5)
    /**
     * The singleton instance for the day-of-week of Saturday.
     * This has the numeric value of {@code 6}.
     */
    public static readonly SATURDAY = DayOfWeek.of(6)
    /**
     * The singleton instance for the day-of-week of Sunday.
     * This has the numeric value of {@code 7}.
     */
    public static readonly SUNDAY = DayOfWeek.of(7)

    private constructor(public readonly value: number) {
        assert(math.type(value) == "integer" && value >= 1 && value <= 7)

        cache[value] = this
    }

    /**
     * Obtains an instance of {@code DayOfWeek} from an {@code int} value.
     * <p>
     * {@code DayOfWeek} is a class representing the 7 days of the week.
     * This factory allows the class to be obtained from the {@code int} value.
     * The {@code int} value follows the ISO-8601 standard, from 1 (Monday) to 7 (Sunday).
     *
     * @param dayOfWeek  the day-of-week to represent, from 1 (Monday) to 7 (Sunday)
     * @return the day-of-week singleton
     */
    public static of(dayOfWeek: number): DayOfWeek {
        return cache[dayOfWeek] ?? new DayOfWeek(dayOfWeek)
    }

    public static deserialize(reader: BinaryReader): DayOfWeek {
        return DayOfWeek.of(reader.readUInt8())
    }

    public serialize(writer: BinaryWriter): void {
        writer.writeUInt8(this.value)
    }

    /**
     * Returns the day-of-week that is the specified number of days after this one.
     * <p>
     * The calculation rolls around the end of the week from Sunday to Monday.
     * The specified period may be negative.
     * <p>
     * This instance is immutable and unaffected by this method call.
     *
     * @param days  the days to add, positive or negative
     * @return the resulting day-of-week
     */
    public plus(days: number): DayOfWeek {
        return DayOfWeek.of(((this.value - 1 + ((days % 7) + 7)) % 7) + 1)
    }

    /**
     * Returns the day-of-week that is the specified number of days before this one.
     * <p>
     * The calculation rolls around the start of the year from Monday to Sunday.
     * The specified period may be negative.
     * <p>
     * This instance is immutable and unaffected by this method call.
     *
     * @param days  the days to subtract, positive or negative
     * @return the resulting day-of-week
     */
    public minus(days: number): DayOfWeek {
        return this.plus(-(days % 7))
    }

    /**
     * Outputs this day-of-week as a {@code string}.
     *
     * @return a string representation of this day-of-week
     */
    public toString(): string {
        return this.value.toString()
    }

    private __lt(other: DayOfWeek): boolean {
        return this.value < other.value
    }

    private __le(other: DayOfWeek): boolean {
        return this.value <= other.value
    }
}
