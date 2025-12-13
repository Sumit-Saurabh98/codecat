"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  disconnectRepository,
  disconnectAllRepositories,
  getConnectedRepositiories,
} from "../actions";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Trash2 } from "lucide-react";

const RepositoryList = () => {
  const queryClient = useQueryClient();

  const [disconnectedAllOpen, setDisconnectedAllOpen] = useState(false);

  const { data: repositories = [], isLoading } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: async () => await getConnectedRepositiories(),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
  const disconnectMutation = useMutation({
    mutationFn: async (repositoryid: string) => {
      return await disconnectRepository(repositoryid);
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        toast.success("Repository disconnected successfully");
      }
    },
    onError: (error) => {
      toast.error(
        `Failed to disconnect repository: ${error.message || "Unknown error"}`
      );
      console.error("Disconnect repository error:", error);
    },
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      return await disconnectAllRepositories();
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        toast.success(`Disconnected all repositories successfully`);
        setDisconnectedAllOpen(false);
      }
    },
    onError: (error) => {
      toast.error(
        `Failed to disconnect repository: ${error.message || "Unknown error"}`
      );
      console.error("Disconnect repository error:", error);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            manage you connected GitHub repositories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connected Repositories</CardTitle>
            <CardDescription>
              manage you connected GitHub repositories.
            </CardDescription>
          </div>
          {repositories && repositories?.length > 0 && (
            <AlertDialog
              open={disconnectedAllOpen}
              onOpenChange={setDisconnectedAllOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant={"destructive"} size={"sm"} className="cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disconnect All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Disconnect all repositories?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will disconnect {repositories!.length}{" "}
                    repositories and delete all associated AI reviews. This
                    Action can not be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => disconnectAllMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={disconnectAllMutation.isPending}
                  >
                    {disconnectAllMutation.isPending
                      ? "Disconnecting..."
                      : "Disconnect All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {repositories?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>no Repository conncted yet.</p>
            <p className="text-sm mt-2">
              Connected repositories from the repository page
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {repositories?.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{repo.fullname}</h3>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"ghost"} size={"sm"} className="ml-4 text-destractive hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Disconnect repository?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will disconnect this repository and delete
                        all associated AI reviews. This Action can not be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => disconnectMutation.mutate(repo.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectMutation.isPending
                          ? "Disconnecting..."
                          : "Disconnect"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default RepositoryList;
