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

export const getRepositories = async (page:number=1, perPage:number=10) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const {data} = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page,
  })

  return data;
}

export const createWebhook = async (owner:string, repo:string) =>{
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const webhookuRL = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  const {data: hooks} = await octokit.rest.repos.listWebhooks({
    owner,
    repo
  })

  const existingHook = hooks.find((hook) => hook.config.url === webhookuRL);
  
  if(existingHook){
    return existingHook;
  }

  const {data} = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookuRL,
      content_type: "json"
    },
    events: ["pull_request"],
  });

  return data;
}
