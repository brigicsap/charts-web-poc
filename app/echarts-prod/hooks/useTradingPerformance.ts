import { useQuery } from "@tanstack/react-query";
import { makeTradingPerformanceResponse } from "../data/tradingMockResponses";

export function useTradingPerformance(date: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tradingPerformance", date],
    queryFn: () => Promise.resolve(makeTradingPerformanceResponse(date)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data, isLoading, error };
}
