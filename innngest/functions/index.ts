import { inngest } from "@/innngest/client";
import prisma from "@/lib/db";
import { indexCodebase } from "@/module/ai/lib/rag";
import { getRepoFileContents } from "@/module/github/lib/github";
export const indexRepo = inngest.createFunction(
  {id: "index-repo"},
  {event: "repository.connected"},
  async ({event, step}) => {
    const {owner, repo, userId} = event.data;

    // fetch all the files of the repo

    const files = await step.run("fetch-files", async() =>{
      const account = await prisma.account.findFirst({
        where:{
          userId,
          providerId: "github"
        }
      })

      if(!account){
        throw new Error("Account not found")
      }

      return await getRepoFileContents(account.accessToken as string, owner, repo)
      
    })

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files)
    })

    return {success:true, indexedFiles: files.length}
  }
)


