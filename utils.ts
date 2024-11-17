import { RequestMetrics } from "./types";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function calculatePercentile(
  sortedNumbers: number[],
  percentile: number
): number {
  const index = Math.floor(sortedNumbers.length * percentile);
  return sortedNumbers[index];
}

export async function runRequest(url: string): Promise<RequestMetrics> {
  const start = performance.now();
  const response = await fetch(url);
  const end = performance.now();

  return {
    duration: end - start,
    timestamp: new Date(),
    status: response.status,
  };
}
