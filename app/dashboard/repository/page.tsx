"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRepositories } from "@/module/repository/hooks/use-repositories";
import { ExternalLink, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RepositoryListSkeleton } from "./components/repository-skeleton";
import { error } from "console";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  isConnected?: boolean;
}
const Repositorypage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  useEffect(()=>{
    const observer = new IntersectionObserver(
      (entries) =>{
        if(entries[0].isIntersecting && hasNextPage && !isFetchingNextPage){
          fetchNextPage();
        }
      },
      {
        threshold: 0.1
      }
    )

    const currentTarget = observerTarget.current;
    if(currentTarget){
      observer.observe(currentTarget);
    }

    return () => {
      if(currentTarget){
        observer.unobserve(currentTarget);
      }
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage])

  if(isLoading){
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">Manage and view all your GitHub repositories</p>
        </div>
        <RepositoryListSkeleton/>
      </div>
    )
  }

  if(isError){
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">Manage and view all your GitHub repositories</p>
        </div>
        <div className="text-red-500">Error loading repositories</div>
      </div>
    )
  }

  const allRepositories = data?.pages.flatMap((page) => page) || [];

  const filteredRepositories = allRepositories.filter(
    (repo) =>
      repo.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
      repo.full_name
        .toLocaleLowerCase()
        .includes(searchQuery.toLocaleLowerCase())
  );

  const handleConnect = async (repo: Repository) => {}

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
        <p className="text-muted-foreground">
          Manage and view all your GitHub repositories
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {
          filteredRepositories.map((repo)=>(
            <Card key={repo.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{repo.name}</CardTitle>
                      <Badge variant={"outline"}>{repo.language || "unknown"}</Badge>
                      {repo.isConnected && <Badge variant={"secondary"}>Connected</Badge>}
                    </div>
                    <CardDescription>{repo.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant={"ghost"} size={"icon"} asChild>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4"/>
                      </a>
                    </Button>
                    <Button 
                    onClick={()=>handleConnect(repo)}
                    disabled={localConnectingId === repo.id || repo.isConnected}
                    variant={repo.isConnected ? "outline" : "default"}
                    >
                      {localConnectingId === repo.id ? "Connecting..." : repo.isConnected ? "Connected" : "Connect"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Stars:</span>
                  <span className="text-sm font-medium">{repo.stargazers_count}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {repo.topics && repo.topics.length > 0 ? (
                    repo.topics.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No topics</span>
                  )}
                </div>
                </>
              </CardContent>
            </Card>
          ))
        }
      </div>

      <div ref={observerTarget} className="py-4">
        {
          isFetchingNextPage && <RepositoryListSkeleton/>
        }
        {
          !hasNextPage && allRepositories.length > 0 && (
            <p className="text-center text-muted-foreground">No more repositories</p>
          )
        }
      </div>
    </div>
  );
};
export default Repositorypage;
