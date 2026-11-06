// Format major daily axis ticks and return the fallback for other times.
export function formatDailyTimeTick(time: string, fallback = ""): string {
	if (time === "00:00" || time === "24:00") return "12am";
	if (time === "06:00") return "6am";
	if (time === "12:00") return "12pm";
	if (time === "18:00") return "6pm";
	return fallback;
}
