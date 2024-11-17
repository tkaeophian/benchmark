type RequestMetrics = {
  duration: number;
  timestamp: Date;
  status: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRequest(url: string): Promise<RequestMetrics> {
  const start = performance.now();
  const response = await fetch(url);
  const end = performance.now();

  return {
    duration: end - start,
    timestamp: new Date(),
    status: response.status,
  };
}

function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function calculatePercentile(
  sortedNumbers: number[],
  percentile: number
): number {
  const index = Math.floor(sortedNumbers.length * percentile);
  return sortedNumbers[index];
}

async function runBenchmark(
  url: string,
  iterations: number = 300
): Promise<void> {
  console.log(`Starting benchmark for ${url}`);
  console.log(`Running ${iterations} iterations...`);

  const results: RequestMetrics[] = [];
  const errors: Error[] = [];

  for (let i = 0; i < iterations; i++) {
    try {
      const progress = Math.round((i / iterations) * 100);
      process.stdout.write(`\rProgress: ${progress}% (${i}/${iterations})`);

      const result = await runRequest(url);
      results.push(result);

      // Small delay to prevent overwhelming the server
      await delay(10);
    } catch (error) {
      errors.push(error as Error);
    }
  }

  console.log("\n\nBenchmark complete!");

  if (results.length === 0) {
    console.log("No successful requests. Exiting...");
    return;
  }

  const durations = results.map((r) => r.duration);
  const sortedDurations = durations.sort((a, b) => a - b);

  const totalRequests = results.length;
  const failedRequests = errors.length;
  const average = durations.reduce((a, b) => a + b, 0) / totalRequests;
  const median = calculateMedian(sortedDurations);
  const minLatency = sortedDurations[0];
  const maxLatency = sortedDurations[sortedDurations.length - 1];
  const p95 = calculatePercentile(sortedDurations, 0.95);
  const p99 = calculatePercentile(sortedDurations, 0.99);

  // Display results
  console.log("\nResults:");
  console.log("-".repeat(50));
  console.table([
    { Metric: "Total Requests", Value: results.length },
    { Metric: "Failed Requests", Value: errors.length },
    { Metric: "Average Latency (ms)", Value: Number(average.toFixed(2)) },
    { Metric: "Median Latency (ms)", Value: Number(median.toFixed(2)) },
    { Metric: "Min Latency (ms)", Value: Number(minLatency.toFixed(2)) },
    { Metric: "Max Latency (ms)", Value: Number(maxLatency.toFixed(2)) },
    { Metric: "95th Percentile (ms)", Value: Number(p95.toFixed(2)) },
    { Metric: "99th Percentile (ms)", Value: Number(p99.toFixed(2)) },
  ]);

  // Log errors if any
  if (failedRequests > 0) {
    console.log("\nErrors encountered:");
    errors.forEach((error, index) => {
      console.log(`Error ${index + 1}: ${error.message}`);
    });
  }
}

// Execute the benchmark
const url = process.argv[2];
if (!url) {
  console.error("Usage: node benchmark.js <url>");
  process.exit(1);
}

runBenchmark(url).catch((error) => {
  console.error("Benchmark encountered an error:", error);
});
