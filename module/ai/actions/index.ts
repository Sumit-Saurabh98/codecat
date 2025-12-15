"use server";

import { inngest } from "@/innngest/client";
import prisma from "@/lib/db";
import { getPullRequestDiff } from "@/module/github/lib/github";

export async function reviewPullRequest(
  repoId: number,
  prNumber: number
) {
  console.log(`Starting review process for repository ID ${repoId} #${prNumber}`);

  try {
    console.log(`Looking up repository with ID ${repoId} in database...`);
    const repository = await prisma.repository.findFirst({
    where: {
      githubId: BigInt(repoId),
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
    throw new Error(`Repository with ID ${repoId} not found in database. Please reconnect the repository.`);
  }

  console.log(`Found repository in DB: ${repository.id} (${repository.owner}/${repository.name})`);

  const githubAccount = repository.user.accounts[0];

  if(!githubAccount?.accessToken){
    throw new Error("Github access token not found")
  }

  console.log(`Found GitHub access token for user: ${repository.user.id}`);

  const token = githubAccount.accessToken;

  const {title} = await getPullRequestDiff(token, repository.owner, repository.name, prNumber)

  console.log(`Fetched PR diff. Title: "${title}". Sending to Inngest...`);

  const eventData = {
    name: "pr.review-requested",
    data: {
      owner: repository.owner,
      repo: repository.name,
      prNumber,
      userId: repository.user.id,
    },
  };

  console.log(`Sending Inngest event:`, JSON.stringify(eventData, null, 2));

  const result = await inngest.send(eventData);

  console.log(`Inngest event sent successfully:`, result);

  return {success:true, message:"Review Queued"}
  } catch (error) {
    console.error(`Error in reviewPullRequest for repository ID ${repoId} #${prNumber}:`, error);

    try {
        const repository = await prisma.repository.findFirst({
          where: {
            githubId: BigInt(repoId),
          }
        })

        if(repository){
            await prisma.review.create({
                data: {
                    repositoryId: repository.id,
                    prNumber,
                    prTitle: "Failed to review pull request",
                    prUrl: `https://github.com/${repository.owner}/${repository.name}/pull/${prNumber}`,
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
