import { inngest } from "@/innngest/client";
import { indexRepo } from "@/innngest/functions";
import { generateReview } from "@/innngest/functions/review";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    indexRepo,
    generateReview
  ],
});