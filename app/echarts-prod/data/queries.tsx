"use client";

import {
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { z } from "zod";
import {
	batteryResponseSchema,
	energyResponseSchema,
	type ChartKind,
	type Resolution,
	type Scenario,
} from "./contracts";
import { getDateRange, TIMEZONE } from "./dates";

class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
	}
}

const ScenarioContext = createContext<Scenario>("success");

export function DataProvider({
	children,
	scenario,
}: {
	children: ReactNode;
	scenario: Scenario;
}) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60_000,
						gcTime: 300_000,
						retry: (attempt, error) =>
							error instanceof ApiError && error.status >= 500 && attempt < 1,
						refetchOnWindowFocus: false,
					},
				},
			}),
	);
	return (
		<QueryClientProvider client={client}>
			<ScenarioContext.Provider value={scenario}>
				{children}
			</ScenarioContext.Provider>
		</QueryClientProvider>
	);
}

type QueryInput = { date: string; resolution: Resolution };

export function getRequest(
	kind: ChartKind,
	input: QueryInput,
	scenario: Scenario,
) {
	const range = getDateRange(input.date, input.resolution);
	const params = {
		date: range.from,
		resolution: input.resolution,
		timezone: TIMEZONE,
		scenario,
	};
	return {
		queryKey: ["echarts-prod", kind, { ...params, ...range }] as const,
		url: `/echarts-prod/api/${kind}?${new URLSearchParams(params)}`,
	};
}

async function fetchResponse<Result>(
	url: string,
	schema: z.ZodType<Result>,
	signal: AbortSignal,
): Promise<Result> {
	const response = await fetch(url, { signal });
	if (!response.ok)
		throw new ApiError(`Request failed (${response.status})`, response.status);
	const parsed = schema.safeParse(await response.json());
	if (!parsed.success)
		throw new Error("Response doesn't match the expected chart data");
	return parsed.data;
}

export function useEnergyData(
	kind: "home-usage" | "import-export",
	input: QueryInput,
) {
	const scenario = useContext(ScenarioContext);
	const request = getRequest(kind, input, scenario);
	return {
		...useQuery({
			queryKey: request.queryKey,
			queryFn: ({ signal }) =>
				fetchResponse(request.url, energyResponseSchema, signal),
		}),
		request,
	};
}

export function useBatteryData(input: QueryInput) {
	const scenario = useContext(ScenarioContext);
	const request = getRequest("battery-history", input, scenario);
	return {
		...useQuery({
			queryKey: request.queryKey,
			queryFn: ({ signal }) =>
				fetchResponse(request.url, batteryResponseSchema, signal),
		}),
		request,
	};
}
