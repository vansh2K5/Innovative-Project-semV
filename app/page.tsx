"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";
import { Card } from "@/components/ui/card";

const Page = () => {
  const [isHidden, setIsHidden] = useState(false);
  const router = useRouter();

  // Redirect to login page on mount
  useEffect(() => {
    router.push("/login");
  }, [router]);

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
            <h2 className="mt-2 text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-white/70 mt-1 text-sm">Log in to your account</p>
          </div>
          <form className="flex flex-col gap-4">
            <input
              type="email"
              className="w-full px-4 py-3 rounded-full border border-white/30 bg-white/20 text-white placeholder:text-white/60 shadow-inner outline-none focus:ring-2 focus:ring-violet-500 transition"
              placeholder="Email"
              required
            />
            <input
              type="password"
              className="w-full px-4 py-3 rounded-full border border-white/30 bg-white/20 text-white placeholder:text-white/60 shadow-inner outline-none focus:ring-2 focus:ring-violet-500 transition"
              placeholder="Password"
              required
            />
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500  to-red-500 to-purple-600  
    animated-gradient transition-transform duration-300 ease-linear text-white font-semibold shadow transform hover:scale-105"
            >
              Login
            </button>

            <a
              href="#"
              className="text-xs mt-3 text-white/60 hover:underline text-center"
            >
              Forgot password?
            </a>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Page;
