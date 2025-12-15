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

  const result = await inngest.send({
    name: "pr.review-requested",
    data: {
      owner,
      repo,
      prNumber,
      userId: repository.user.id,
    },
  });

  console.log(`Inngest event sent successfully:`, result);

  return {success:true, message:"Review Queued"}
  } catch (error) {
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
        console.error("Database error:", dberror);
    }
  }
}
