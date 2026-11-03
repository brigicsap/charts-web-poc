"use client";

import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import type { Resolution } from "../data/contracts";
import { batteryResponseSchema } from "../data/contracts";
import { fetchResponse, getRequest, ScenarioContext } from "../data/queries";

type QueryInput = { date: string; resolution: Resolution };

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
