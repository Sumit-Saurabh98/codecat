'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { getDashboardStatus, getMonthlyActivity } from "@/module/dashboard/actions"
import ContributionGraph from "@/module/dashboard/components/contribution-grapgh"
import { useQuery } from "@tanstack/react-query"
import { GitBranch, GitCommit, GitPullRequest, MessageSquare } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const MainPage = () => {

  const {data:status, isLoading} = useQuery({
    queryKey: ['dashboard-status'],
    queryFn: async () => await getDashboardStatus(),
    refetchOnWindowFocus: false,
  })

  const {data:monthlyActivity, isLoading:isLoadingActivity} = useQuery({
    queryKey: ['monthly-activity'],
    queryFn: async () => await getMonthlyActivity(),
    refetchOnWindowFocus: false,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">OverView  of you coding activity and ai reviews</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                isLoading ? 'Loading...' : status?.totalRepos || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Connected Repositories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                isLoading ? 'Loading...' : status?.totalCommits || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">In the last year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                isLoading ? 'Loading...' : status?.totalPRs || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">All Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                isLoading ? 'Loading...' : status?.totalReviews || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Generated Reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>Visualizing your coding frequency over the last year</CardDescription>
        </CardHeader>
        <CardContent>
          <ContributionGraph/>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Monthly breakdown of Commits, Pull Requests, and Reviews.</CardDescription>
        </CardHeader>

        <CardContent>
          {
            isLoadingActivity ? (
              <div className="h-80 w-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width={"100%"} height={"100%"}>
                  <BarChart data={monthlyActivity || []} >
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="month" />
                    <YAxis/>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                    itemStyle={{color: 'var(--foreground)'}}
                    />
                    <Legend/>
                    <Bar dataKey="commits" name="Commits" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="prs" name="Pull Requests" fill="#8b5cf6" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="reviews" name="AI Reviews" fill="#10b981" radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  )
}
export default MainPage
