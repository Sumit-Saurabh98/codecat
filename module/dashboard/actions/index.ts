"use server";

import {
  fetchUserContributions,
  getGithubToken,
} from "@/module/github/lib/github";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import prisma from "@/lib/db";

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

    // TODO: FETCH TOTAL CONNECTED REPO FROM DB
    const totalRepos = 30;

    const calendar = await fetchUserContributions(token, user.login);
    const totalCommits = calendar?.totalContributions || 0;

    // count PRs from database or github
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr`,
      per_page: 1,
    });

    const totalPRs = prs.total_count;

    // TODO: COUNT AI REVIEWS FROM DB
    const totalReviews = 44;

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

    // TODO: FETCH REVIEWS REAL DATA
    const generateSampleReviews = () => {
      const sampleReviews = [];
      const now = new Date();

      // Generate reviews over the past 6 months
      for (let i = 0; i < 45; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 180); // Random number of days within 6 months
        const reviewDate = new Date(now);
        reviewDate.setDate(reviewDate.getDate() - randomDaysAgo);

        sampleReviews.push({
          createdAt: reviewDate,
        });
      }

      return sampleReviews;
    };

    const reviews = generateSampleReviews();

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
