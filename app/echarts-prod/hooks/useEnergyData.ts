"use client";

import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import type { Resolution } from "../data/contracts";
import { energyResponseSchema } from "../data/contracts";
import { fetchResponse, getRequest, ScenarioContext } from "../data/queries";

type QueryInput = { date: string; resolution: Resolution };

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
