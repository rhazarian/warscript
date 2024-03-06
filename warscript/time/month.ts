import { BinaryReader } from "../binaryreader"
import { BinaryWriter } from "../binarywriter"

const cache: Record<number, Month | undefined> = setmetatable({}, { __mode: "v" })

/**
 * A month-of-year, such as 'July'.
 * <p>
 * {@code Month} is a class representing the 12 months of the year -
 * January, February, March, April, May, June, July, August, September, October,
 * November and December.
 * <p>
 * This class represents a common concept that is found in many calendar systems.
 * As such, this class may be used by any calendar system that has the month-of-year
 * concept defined exactly equivalent to the ISO-8601 calendar system.
 */
export class Month {
    /**
     * The singleton instance for the month of January with 31 days.
     * This has the numeric value of {@code 1}.
     */
    public static readonly JANUARY = Month.of(1)
    /**
     * The singleton instance for the month of February with 28 days, or 29 in a leap year.
     * This has the numeric value of {@code 2}.
     */
    public static readonly FEBRUARY = Month.of(2)
    /**
     * The singleton instance for the month of March with 31 days.
     * This has the numeric value of {@code 3}.
     */
    public static readonly MARCH = Month.of(3)
    /**
     * The singleton instance for the month of April with 30 days.
     * This has the numeric value of {@code 4}.
     */
    public static readonly APRIL = Month.of(4)
    /**
     * The singleton instance for the month of May with 31 days.
     * This has the numeric value of {@code 5}.
     */
    public static readonly MAY = Month.of(5)
    /**
     * The singleton instance for the month of June with 30 days.
     * This has the numeric value of {@code 6}.
     */
    public static readonly JUNE = Month.of(6)
    /**
     * The singleton instance for the month of July with 31 days.
     * This has the numeric value of {@code 7}.
     */
    public static readonly JULY = Month.of(7)
    /**
     * The singleton instance for the month of August with 31 days.
     * This has the numeric value of {@code 8}.
     */
    public static readonly AUGUST = Month.of(8)
    /**
     * The singleton instance for the month of September with 30 days.
     * This has the numeric value of {@code 9}.
     */
    public static readonly SEPTEMBER = Month.of(9)
    /**
     * The singleton instance for the month of October with 31 days.
     * This has the numeric value of {@code 10}.
     */
    public static readonly OCTOBER = Month.of(10)
    /**
     * The singleton instance for the month of November with 30 days.
     * This has the numeric value of {@code 11}.
     */
    public static readonly NOVEMBER = Month.of(11)
    /**
     * The singleton instance for the month of December with 31 days.
     * This has the numeric value of {@code 12}.
     */
    public static readonly DECEMBER = Month.of(12)

    private constructor(public readonly value: number) {
        assert(math.type(value) == "integer" && value >= 1 && value <= 12)

        cache[value] = this
    }

    /**
     * Obtains an instance of {@code Month} from an {@code int} value.
     * <p>
     * {@code Month} is a class representing the 12 months of the year.
     * This factory allows the class to be obtained from the {@code int} value.
     * The {@code int} value follows the ISO-8601 standard, from 1 (January) to 12 (December).
     *
     * @param month  the month-of-year to represent, from 1 (January) to 12 (December)
     * @return the month-of-year
     */
    public static of(month: number): Month {
        return cache[month] ?? new Month(month)
    }

    public static deserialize(reader: BinaryReader): Month {
        return Month.of(reader.readUInt8())
    }

    public serialize(writer: BinaryWriter): void {
        writer.writeUInt8(this.value)
    }

    /**
     * Returns the month-of-year that is the specified number of months after this one.
     * <p>
     * The calculation rolls around the end of the year from December to January.
     * The specified period may be negative.
     * <p>
     * This instance is immutable and unaffected by this method call.
     *
     * @param months  the months to add, positive or negative
     * @return the resulting month
     */
    public plus(months: number): Month {
        return Month.of(((this.value - 1 + ((months % 12) + 12)) % 12) + 1)
    }

    /**
     * Returns the month-of-year that is the specified number of months before this one.
     * <p>
     * The calculation rolls around the start of the year from January to December.
     * The specified period may be negative.
     * <p>
     * This instance is immutable and unaffected by this method call.
     *
     * @param months  the months to subtract, positive or negative
     * @return the resulting month
     */
    public minus(months: number): Month {
        return this.plus(-(months % 12))
    }

    /**
     * Gets the length of this month in days.
     * <p>
     * This takes a flag to determine whether to return the length for a leap year or not.
     * <p>
     * February has 28 days in a standard year and 29 days in a leap year.
     * April, June, September and November have 30 days.
     * All other months have 31 days.
     *
     * @param leapYear  true if the length is required for a leap year
     * @return the length of this month in days, from 28 to 31
     */
    public getLength(leapYear: boolean): number {
        switch (this) {
            case Month.FEBRUARY:
                return leapYear ? 29 : 28
            case Month.APRIL:
            case Month.JUNE:
            case Month.SEPTEMBER:
            case Month.NOVEMBER:
                return 30
            default:
                return 31
        }
    }

    /**
     * Gets the day-of-year corresponding to the first day of this month.
     * <p>
     * This returns the day-of-year that this month begins on, using the leap
     * year flag to determine the length of February.
     *
     * @param leapYear  true if the length is required for a leap year
     * @return the day of year corresponding to the first day of this month, from 1 to 336
     */
    public getFirstDayOfYear(leapYear: boolean): number {
        const leap = leapYear ? 1 : 0
        switch (this) {
            case Month.JANUARY:
                return 1
            case Month.FEBRUARY:
                return 32
            case Month.MARCH:
                return 60 + leap
            case Month.APRIL:
                return 91 + leap
            case Month.MAY:
                return 121 + leap
            case Month.JUNE:
                return 152 + leap
            case Month.JULY:
                return 182 + leap
            case Month.AUGUST:
                return 213 + leap
            case Month.SEPTEMBER:
                return 244 + leap
            case Month.OCTOBER:
                return 274 + leap
            case Month.NOVEMBER:
                return 305 + leap
            case Month.DECEMBER:
            default:
                return 335 + leap
        }
    }

    /**
     * Outputs this month as a {@code string}.
     *
     * @return a string representation of this month
     */
    public toString(): string {
        return this.value.toString()
    }

    private __lt(other: Month): boolean {
        return this.value < other.value
    }

    private __le(other: Month): boolean {
        return this.value <= other.value
    }
}
