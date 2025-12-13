"use server";

import { inngest } from "@/innngest/client";
import prisma from "@/lib/db";
import { getPullRequestDiff } from "@/module/github/lib/github";

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
) {
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

  const githubAccount = repository.user.accounts[0];

  if(!githubAccount?.accessToken){
    throw new Error("Github access token not found")
  }

  const token = githubAccount.accessToken;

  const {title} = await getPullRequestDiff(token, owner, repo, prNumber)

  await inngest.send({
    name: "pr.review-requested",
    data: {
      owner,
      repo,
      prNumber,
      userId: repository.user.id,
    },
  });

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
