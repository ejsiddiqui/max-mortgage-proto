import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Home, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "forgotPassword">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      await signIn("password", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        flow: "signIn",
      });
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-[#003399] to-[#0055ff] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#05f240]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Max Mortgage</h1>
              <p className="text-blue-100 text-sm">Lead Management System</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Streamline Your<br />
            Mortgage Pipeline
          </h2>
          <p className="text-blue-100 text-lg max-w-md mb-12">
            Track leads, manage documents, and close deals faster with our comprehensive mortgage management platform.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold">2.5K+</p>
              <p className="text-blue-200 text-sm">Active Projects</p>
            </div>
            <div>
              <p className="text-3xl font-bold">AED 48M</p>
              <p className="text-blue-200 text-sm">Loans Processed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-blue-200 text-sm">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#002060] to-[#003399] rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Max Mortgage</h1>
              <p className="text-xs text-slate-600">Lead Management</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl border border-border p-8 shadow-xl shadow-muted/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {step === "signIn" ? "Welcome back" : "Reset Password"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {step === "signIn" ? "Sign in to your account to continue" : "Enter your email to receive a reset link"}
              </p>
            </div>

            {step === "signIn" ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@maxmortgage.com"
                      className="w-full px-4 py-3 pl-11 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-all"
                      required
                    />
                    <Mail className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pl-11 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-all"
                      required
                    />
                    <Lock className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("forgotPassword")}
                    className="text-sm font-medium text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-semibold rounded-xl shadow-lg shadow-sidebar/25 transition-all flex items-center justify-center gap-2 border-none"
                >
                  {isLoading ? "Signing in..." : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setStep("signIn"); toast.success("Reset link sent!"); }} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@maxmortgage.com"
                      className="w-full px-4 py-3 pl-11 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-all"
                      required
                    />
                    <Mail className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full py-6 bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-semibold rounded-xl shadow-lg shadow-sidebar/25 transition-all border-none"
                >
                  Send Reset Link
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("signIn")}
                  className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Sign In
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground">authorized access only</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              New user?{" "}
              <button className="font-medium text-primary hover:underline">
                Contact Admin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
