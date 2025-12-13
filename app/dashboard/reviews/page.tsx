"use client";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/module/review/actions";
import { Button } from "@/components/ui/button";

const ReviewsPage = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => await getReviews(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
        <p className="text-muted-foreground">View all AI code reviews</p>
      </div>

      {reviews?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p>
                No reviews yet. Connect a repository and open a pull request to
                get started wi ai reviews.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews?.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-ls">
                        {review.prTitle}
                      </CardTitle>
                      {review.status === "completed" && (
                        <Badge variant={"default"} className="gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </Badge>
                      )}
                      {
                        review.status === "pending" && (
                          <Badge variant={"secondary"} className="gap-1">
                            <Clock className="w-4 h-4" />
                            Pending
                          </Badge>
                        )
                      }
                      {
                        review.status === "failed" && (
                          <Badge variant={"destructive"} className="gap-1">
                            <XCircle className="w-4 h-4" />
                            Failed
                          </Badge>
                        )
                      }
                    </div>
                    <CardDescription>
                        {review.repository.fullname} . PR #{review.prNumber}
                    </CardDescription>
                  </div>
                  <Button variant={"ghost"} size={"icon"} asChild>
                    <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), {addSuffix:true})}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="bg-muted p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap text-xs">{review.review.substring(0, 300)}...</pre>
                        </div>
                    </div>
                    <Button variant={"outline"} asChild>
                        <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
                            View all review on GitHub
                        </a>
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default ReviewsPage;
