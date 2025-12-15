"use client";

import { useState, useEffect } from "react";
import { Github, Code2, GitPullRequest, Activity, Sparkles, Star, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { getLandingPageStats } from "@/module/dashboard/actions";
import { useRouter } from "next/navigation";

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRepositories: 0,
    totalReviews: 0,
    totalPRsReviewed: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getLandingPageStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Keep default values on error
      }
    };

    fetchStats();
  }, []);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Login error", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "700ms" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative">
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">CodeCat</h1>
          </div>
          <Button
            onClick={()=>router.push("/login")}
            disabled={isLoading}
            variant="outline"
            className="hidden sm:flex"
          >
            {isLoading ? "Connecting..." : "Get Started"}
          </Button>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-12 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Intelligent Code Reviews{" "}
                <span className="text-primary">for Every Pull Request</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto">
                Elevate your code quality with AI-powered reviews that catch issues early,
                provide smart suggestions, and accelerate your development workflow.
              </p>
            </div>

            <div className="flex items-center justify-center gap-x-6 mb-12">
              <Button
                size="lg"
                onClick={()=>router.push("/login")}
                disabled={isLoading}
                className="text-lg px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5 mr-2" />
                    Start with GitHub
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <Button variant="ghost" size="lg" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary">{formatNumber(stats.totalPRsReviewed)}+{stats.totalPRsReviewed > 0 ? '' : '0'}</div>
                <div className="text-sm text-muted-foreground">Pull Requests Reviewed</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary">{formatNumber(stats.totalUsers)}+{stats.totalUsers > 0 ? '' : '0'}</div>
                <div className="text-sm text-muted-foreground">Active Developers</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary">{formatNumber(stats.totalRepositories)}+{stats.totalRepositories > 0 ? '' : '0'}</div>
                <div className="text-sm text-muted-foreground">Repositories Connected</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 lg:px-8 lg:py-24 bg-muted/30">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Choose CodeCat?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the future of code review with our comprehensive AI-powered platform
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <GitPullRequest className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Automated PR Reviews</h3>
                <p className="text-muted-foreground">
                  Get instant, intelligent code reviews on every pull request with actionable feedback and suggestions.
                </p>
              </div>

              <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">GitHub Activity Dashboard</h3>
                <p className="text-muted-foreground">
                  Track and visualize your development activity across all repositories in one comprehensive dashboard.
                </p>
              </div>

              <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Smart suggestions to improve code quality, catch bugs early, and maintain best practices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                  Accelerate Your Development Workflow
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Reduce review time by up to 60% with automated analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Catch critical bugs and security issues before they reach production</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Maintain consistent code quality across your entire team</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Integrate seamlessly with your existing GitHub workflow</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Code Quality</span>
                    <span className="text-sm text-muted-foreground">95%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Review Speed</span>
                    <span className="text-sm text-muted-foreground">3x Faster</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Bug Detection</span>
                    <span className="text-sm text-muted-foreground">99%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 lg:px-8 lg:py-24 bg-primary/5">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Ready to Transform Your Code Reviews?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have already improved their code quality with CodeCat.
              Start your free trial today.
            </p>
            <Button
              size="lg"
              onClick={()=>router.push("/login")}
              disabled={isLoading}
              className="text-lg px-8 py-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="w-5 h-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 lg:px-8 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">CodeCat</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 CodeCat. Elevating code quality, one review at a time.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
