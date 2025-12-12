import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

interface contributionData {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: {
          contributionDays: {
            contributionCount: number;
            date: string | Date;
            color: string;
          }[];
        }[];
      };
    };
  };
}

// get the github access token
export const getGithubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account) {
    throw new Error("GitHub access token not found");
  }

  return account.accessToken;
};

// fetch user contributions
export const fetchUserContributions = async (
  token: string,
  username: string
) => {
  const octokit = new Octokit({ auth: token });

  const query = `
    query($username: String!) {
    user(login: $username) {
        contributionsCollection {
            contributionCalendar {
                totalContributions
                weeks {
                    contributionDays {
                    contributionCount
                    date
                    color
                    }
                }
            }
        }
    }
    }
    `;

  try {
    const response: contributionData = await octokit.graphql(query, {
      username,
    });

    if (!response.user) {
      throw new Error("User not found");
    }

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    throw error;
  }
};
