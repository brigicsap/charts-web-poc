import { LocalDate } from "@js-joda/core";
import { setTimeout as delay } from "node:timers/promises";
import {
	chartSchema,
	resolutionSchema,
	scenarioSchema,
} from "../../data/contracts";
import {
	makeBatteryResponse,
	makeEnergyResponse,
} from "../../data/mockResponses";
import { TIMEZONE } from "../../data/dates";

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	context: { params: Promise<{ chart: string }> },
) {
	const { chart } = await context.params;
	const search = new URL(request.url).searchParams;
	const kind = chartSchema.safeParse(chart);
	const resolution = resolutionSchema.safeParse(
		search.get("resolution") ?? "day",
	);
	const scenario = scenarioSchema.safeParse(
		search.get("scenario") ?? "success",
	);
	const date = search.get("date") ?? "2026-04-22";
	if ((search.get("timezone") ?? TIMEZONE) !== TIMEZONE) {
		return Response.json(
			{ message: "This mock only supports Europe/London" },
			{ status: 400 },
		);
	}
	if (!kind.success || !resolution.success || !scenario.success) {
		return Response.json(
			{ message: "Unknown chart, resolution, or scenario" },
			{ status: 400 },
		);
	}
	try {
		LocalDate.parse(date);
	} catch {
		return Response.json({ message: "Invalid date" }, { status: 400 });
	}
	try {
		await delay(scenario.data === "slow" ? 1400 : 180, undefined, {
			signal: request.signal,
		});
	} catch (error) {
		if (request.signal.aborted) return new Response(null, { status: 499 });
		throw error;
	}
	if (scenario.data === "error")
		return Response.json(
			{ message: "Mock service unavailable" },
			{ status: 503 },
		);
	if (scenario.data === "invalid")
		return Response.json({ datapoints: "not an array" });
	const response =
		kind.data === "battery-history"
			? makeBatteryResponse(date, resolution.data, scenario.data)
			: makeEnergyResponse(kind.data, date, resolution.data, scenario.data);
	return Response.json(response, { headers: { "Cache-Control": "no-store" } });
}
