"use client";

import { useState } from "react";
import {
  Github,
  Code2,
  GitPullRequest,
  Activity,
  Sparkles,
} from "lucide-react";
import { signIn } from "@/lib/auth-client";

const Login = ({ redirectTo }: { redirectTo?: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: redirectTo || "/dashboard",
      });
    } catch (error) {
      console.error("Login error", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
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

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Code2 className="w-7 h-7 text-primary-foreground" />
                </div>
                <h1 className="text-5xl font-bold text-primary">CodeCat</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Intelligent Code Reviews for Every Pull Request
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
                  <GitPullRequest className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-foreground">
                    Automated PR Reviews
                  </h3>
                  <p className="text-muted-foreground">
                    Get instant, intelligent code reviews on every pull request
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-foreground">
                    GitHub Activity Dashboard
                  </h3>
                  <p className="text-muted-foreground">
                    Track and visualize your development activity in one place
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-foreground">
                    AI-Powered Insights
                  </h3>
                  <p className="text-muted-foreground">
                    Smart suggestions to improve code quality and catch issues
                    early
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Trusted by developers worldwide to maintain code quality and
                accelerate reviews
              </p>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-foreground">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground">
                  Sign in to continue to your dashboard
                </p>
              </div>

              <button
                onClick={handleGithubLogin}
                disabled={isLoading}
                className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5" />
                    <span>Continue with GitHub</span>
                  </>
                )}
              </button>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Secure OAuth authentication</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Access your repositories instantly</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Start reviewing code in seconds</span>
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to CodeCat&apos;s Terms of Service
                  and Privacy Policy
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                New to CodeCat? Get started in less than a minute
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 py-6 text-center">
        <p className="text-xs text-muted-foreground/60">
          © 2026 CodeCat. Elevating code quality, one review at a time.
        </p>
      </div>
    </div>
  );
};

export default Login;
