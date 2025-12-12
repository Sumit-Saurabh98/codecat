"use client";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getContributionStatus } from "../actions";
const ContributionGraph = () => {
  const { theme } = useTheme();
  const { data: contributionGraphData, isLoading } = useQuery({
    queryKey: ["contribution-graph"],
    queryFn: async () => await getContributionStatus(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6">
        <div className="animate-pulse text-muted-foreground">
          Loading contribution graph...
        </div>
      </div>
    );
  }

  if (
    !contributionGraphData ||
    contributionGraphData.totalContributions === 0
  ) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="text-muted-foreground">
          No contribution data available.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 p-4">
      <div className="text-sm text-muted-foreground">
        <span>{contributionGraphData.totalContributions}</span> contributions in
        the last year
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-max px-4">
          <ActivityCalendar
            data={contributionGraphData.contributions}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={11}
            blockMargin={4}
            fontSize={14}
            showWeekdayLabels
            showMonthLabels
            theme={{
              light: ["hsl(0, 0%, 92%)", "hsl(142, 71%, 45%)"],
              dark: ["#161b22", "hsl(142, 71%, 45%)"],
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default ContributionGraph;
