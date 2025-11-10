"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";
import { Card } from "@/components/ui/card";

const Page = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
      const body = isRegisterMode 
        ? { email, password, name, role: "user" }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isRegisterMode ? "Registration failed" : "Login failed"));
      }

      // Store user data and token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const successMsg = isRegisterMode 
        ? `Welcome ${data.user.name}! Redirecting...` 
        : `Welcome back ${data.user.name}! Redirecting...`;
      
      setSuccess(successMsg);

      // Small delay to show success message
      setTimeout(() => {
        // Redirect based on role
        if (data.user.role === "admin") {
          window.location.href = "/adminUi";
        } else {
          window.location.href = "/homePage";
        }
      }, 800);
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred. Please check if MongoDB is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative  min-h-screen w-full">
      {/* Aurora background */}
      <div className="absolute inset-0 z-0 w-full min-w-screen overflow-hidden">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* Sticky header */}
      <div
        className={`sticky top-0 w-full h-[110px] flex items-center justify-center transition-transform duration-500 z-10 ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="w-3/4 h-[70px] flex items-center justify-between px-8 rounded-full border border-white/30 bg-white/10 shadow-lg backdrop-blur-lg">
          {/* Left */}
          <div className="flex items-center gap-4">
            <span>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              </svg>
            </span>
            <span className="text-white text-xl font-semibold">EMS</span>
          </div>
          {/* Right */}
          <div className="flex space-x-8 items-center">
            <button
              type="button"
              className="text-white/80 text-base font-semibold tracking-wide"
            >
              EFFICIENCY
            </button>
            <button
              type="button"
              className="text-white/80 text-base font-semibold tracking-wide"
            >
              RELIABILITY
            </button>
            <button
              type="button"
              className="text-white/80 text-base font-semibold tracking-wide"
            >
              SECURITY
            </button>
          </div>
        </div>
      </div>

      {/* Content - Login Card */}
      <div className="relative z-20 flex flex-col items-center w-full">
        <Card className="mt-12 relative w-[340px] md:w-[400px] px-8 py-10 rounded-2xl bg-white/10 border border-white/30 shadow-xl backdrop-blur-lg">
          <div className="flex flex-col items-center mb-6">
            <svg width="44" height="44" fill="none" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="white"
                strokeWidth="3"
              ></circle>
            </svg>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {isRegisterMode ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-white/70 mt-1 text-sm">
              {isRegisterMode ? "Sign up for a new account" : "Log in to your account"}
            </p>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50">
              <p className="text-green-200 text-sm text-center">{success}</p>
            </div>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {isRegisterMode && (
              <input
                type="text"
                className="w-full px-4 py-3 rounded-full border border-white/30 bg-white/20 text-white placeholder:text-white/60 shadow-inner outline-none focus:ring-2 focus:ring-violet-500 transition"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              className="w-full px-4 py-3 rounded-full border border-white/30 bg-white/20 text-white placeholder:text-white/60 shadow-inner outline-none focus:ring-2 focus:ring-violet-500 transition"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full px-4 py-3 rounded-full border border-white/30 bg-white/20 text-white placeholder:text-white/60 shadow-inner outline-none focus:ring-2 focus:ring-violet-500 transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500  to-red-500 to-purple-600  
    animated-gradient transition-transform duration-300 ease-linear text-white font-semibold shadow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isRegisterMode ? "Creating Account..." : "Logging in...") 
                : (isRegisterMode ? "Sign Up" : "Login")
              }
            </button>

            <div className="flex flex-col gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError("");
                  setSuccess("");
                }}
                className="text-sm text-white/80 hover:text-white hover:underline text-center transition"
              >
                {isRegisterMode 
                  ? "Already have an account? Login" 
                  : "Don't have an account? Sign Up"
                }
              </button>
              {!isRegisterMode && (
                <a
                  href="#"
                  className="text-xs text-white/60 hover:underline text-center"
                >
                  Forgot password?
                </a>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Page;
