"use server";

import {
  fetchUserContributions,
  getGithubToken,
} from "@/module/github/lib/github";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import prisma from "@/lib/db";

export async function getContributionStatus() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();

    if (!token) {
      throw new Error("GitHub access token not found");
    }

    const octokit = new Octokit({ auth: token });

    // fetch user github username
    const { data: user } = await octokit.rest.users.getAuthenticated();

    if (!user.login) {
      throw new Error("GitHub username not found");
    }

    const calendar = await fetchUserContributions(token, user.login);

    if (!calendar) {
      return null;
    }

    const contributions = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => {
        // GitHub contribution levels based on contribution count ranges
        let level = 0;
        if (day.contributionCount === 0) {
          level = 0;
        } else if (day.contributionCount >= 1 && day.contributionCount <= 9) {
          level = 1;
        } else if (day.contributionCount >= 10 && day.contributionCount <= 19) {
          level = 2;
        } else if (day.contributionCount >= 20 && day.contributionCount <= 29) {
          level = 3;
        } else if (day.contributionCount >= 30) {
          level = 4;
        }

        return {
          date: typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0],
          count: day.contributionCount,
          level,
        };
      })
    );
    return {
      totalContributions: calendar.totalContributions,
      contributions,
    };
  } catch (error) {
    console.error("Error fetching contribution status:", error);
    throw error;
  }
}

export async function getDashboardStatus() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();

    if (!token) {
      throw new Error("GitHub access token not found");
    }
    const octokit = new Octokit({ auth: token });

    // fetch user github username
    const { data: user } = await octokit.rest.users.getAuthenticated();

    if (!user.login) {
      throw new Error("GitHub username not found");
    }

    // Fetch total connected repositories from DB for this user
    const totalRepos = await prisma.repository.count({
      where: {
        userId: session.user.id,
      },
    });

    const calendar = await fetchUserContributions(token, user.login);
    const totalCommits = calendar?.totalContributions || 0;

    // count PRs from database or github
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr`,
      per_page: 1,
    });

    const totalPRs = prs.total_count;

    // Count AI reviews from DB for this user
    const totalReviews = await prisma.review.count({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    });

    return {
      totalRepos,
      totalCommits,
      totalPRs,
      totalReviews,
    };
  } catch (error) {
    console.error("Error fetching dashboard status:", error);
    throw error;
  }
}

export async function getMonthlyActivity() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();

    if (!token) {
      throw new Error("GitHub access token not found");
    }
    const octokit = new Octokit({ auth: token });

    // fetch user github username
    const { data: user } = await octokit.rest.users.getAuthenticated();

    if (!user.login) {
      throw new Error("GitHub username not found");
    }

    const calendar = await fetchUserContributions(token, user.login);

    if (!calendar) {
      return [];
    }

    const monthlyData: {
      [key: string]: { commits: number; prs: number; reviews: number };
    } = {};

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // initilize last 6 months

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 };
    }

    calendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].commits += day.contributionCount;
        }
      });
    });

    // fetch reviews from database for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Fetch real reviews data from database
    const reviews = await prisma.review.findMany({
      where: {
        repository: {
          userId: session.user.id,
        },
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].reviews += 1;
      }
    });

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr created:>${
        sixMonthsAgo.toISOString().split("T")[0]
      }`,
      per_page: 100,
    });

    prs.items.forEach((pr) => {
      const prDate = new Date(pr.created_at!);
      const monthKey = monthNames[prDate.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].prs += 1;
      }
    });

    return Object.keys(monthlyData).map((month) => ({
      month,
      ...monthlyData[month],
    }));
  } catch (error) {
    console.error("Error fetching monthly activity:", error);
    throw error;
  }
}

export async function getLandingPageStats() {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get total repositories count
    const totalRepositories = await prisma.repository.count();

    // Get total reviews count (assuming there's a review table - adjust based on your schema)
    // For now, using a placeholder since I don't see a review table in the schema
    const totalReviews = await prisma.review.count().catch(() => 0);

    // Get total PRs reviewed (this would need to be tracked separately or estimated)
    // For now, using total reviews as approximation
    const totalPRsReviewed = totalReviews;

    return {
      totalUsers: totalUsers || 0,
      totalRepositories: totalRepositories || 0,
      totalReviews: totalReviews || 0,
      totalPRsReviewed: totalPRsReviewed || 0,
    };
  } catch (error) {
    console.error("Error fetching landing page stats:", error);
    // Return fallback values
    return {
      totalUsers: 0,
      totalRepositories: 0,
      totalReviews: 0,
      totalPRsReviewed: 0,
    };
  }
}
