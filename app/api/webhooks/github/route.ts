import { reviewPullRequest } from "@/module/ai/actions";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req:NextRequest){
    try {
        const body = await req.json();
        const event = req.headers.get("x-github-event");

        if(event === "ping"){
            return NextResponse.json({message: "pong"}, {status:200});
        }

        if(event === "pull_request"){
            const action = body.action;
            const repo = body.repository.full_name;
            const prNumber = body.number;

            console.log(`Received PR webhook: ${action} on ${repo} #${prNumber}`);

            const [owner, repoName] = repo.split("/")

            if(action === "opened" || action === "synchronize"){
                console.log(`Processing PR review for ${owner}/${repoName} #${prNumber}`);
                reviewPullRequest(owner, repoName, prNumber)
                .then((result)=>{
                    console.log(`Review queued for ${repo} #${prNumber}:`, result);
                })
                .catch((error)=>{
                    console.error(`Failed to queue review for ${repo} #${prNumber}:`, error);
                })
            }
        }

        // TODO: HANDLE LATER

        return NextResponse.json({message: "Event Processes"}, {status:200});
    } catch (error) {
        console.error("GitHub Webhook Error:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status:500});
    }
}
