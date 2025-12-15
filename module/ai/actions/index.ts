"use server";

import { inngest } from "@/innngest/client";
import prisma from "@/lib/db";
import { getPullRequestDiff } from "@/module/github/lib/github";

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
) {
  console.log(`Starting review process for ${owner}/${repo} #${prNumber}`);

  try {
    console.log(`Looking up repository ${owner}/${repo} in database...`);
    const repository = await prisma.repository.findFirst({
    where: {
      owner,
      name: repo,
    },
    include: {
      user: {
        include: {
          accounts: {
            where: {
              providerId: "github",
            },
          },
        },
      },
    },
  });

  if (!repository) {
    throw new Error(`Repository ${owner}/${repo} not found in database. Please reconnect the repository.`);
  }

  console.log(`Found repository in DB: ${repository.id}`);

  const githubAccount = repository.user.accounts[0];

  if(!githubAccount?.accessToken){
    throw new Error("Github access token not found")
  }

  console.log(`Found GitHub access token for user: ${repository.user.id}`);

  const token = githubAccount.accessToken;

  const {title} = await getPullRequestDiff(token, owner, repo, prNumber)

  console.log(`Fetched PR diff. Title: "${title}". Sending to Inngest...`);

  const eventData = {
    name: "pr.review-requested",
    data: {
      owner,
      repo,
      prNumber,
      userId: repository.user.id,
    },
  };

  console.log(`Sending Inngest event:`, JSON.stringify(eventData, null, 2));

  const result = await inngest.send(eventData);

  console.log(`Inngest event sent successfully:`, result);

  return {success:true, message:"Review Queued"}
  } catch (error) {
    console.error(`Error in reviewPullRequest for ${owner}/${repo} #${prNumber}:`, error);

    try {
        const repository = await prisma.repository.findFirst({
          where: {
            owner,
            name: repo,
          }
        })

        if(repository){
            await prisma.review.create({
                data: {
                    repositoryId: repository.id,
                    prNumber,
                    prTitle: "Failed to review pull request",
                    prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                    review: `Error ${error instanceof Error ? error.message : "Unknown error"}`,
                    status: "failed",
                }
            })
        }
    } catch (dberror) {
        console.error("Database error when saving failed review:", dberror);
    }

    throw error; // Re-throw so the webhook handler can catch it
  }
}
