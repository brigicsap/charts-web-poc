import { Instant } from "@js-joda/core";

// Format a timestamp as a day-time or weekday label, optionally in a timezone.
export function formatTimestamp(
	value: string,
	resolution: "day" | "week",
	timezone?: string,
): string {
	try {
		// Handle ISO instant strings with timezone conversion
		if (timezone && value.endsWith("Z")) {
			const instant = Instant.parse(value);
			return new Intl.DateTimeFormat(
				"en-GB",
				resolution === "week"
					? { weekday: "short", timeZone: timezone }
					: {
							hour: "numeric",
							minute: "2-digit",
							hour12: true,
							timeZone: timezone,
						},
			).format(instant.toEpochMilli());
		}
		// Handle simple date strings
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) {
			return new Intl.DateTimeFormat(
				"en-GB",
				resolution === "week"
					? { weekday: "short" }
					: { hour: "numeric", minute: "2-digit", hour12: true },
			).format(date);
		}
	} catch {
		// Fall through to return value as-is
	}
	return value;
}
