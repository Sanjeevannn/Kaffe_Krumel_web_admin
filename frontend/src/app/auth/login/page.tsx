"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGO_PATH } from "@/lib/constants";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user?.role === "superadmin") {
      router.replace("/superadmin/dashboard");
    } else if (user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = login(email, password);
    if (!result.success) {
      setError(result.message ?? "Login failed");
    }
    setSubmitting(false);
  };

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#00562C]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#00562C] p-4">
      <Card className="w-full max-w-md rounded-3xl border-none shadow-xl">
        <CardContent className="px-5 py-8 sm:px-8 sm:py-10">
          <div className="mb-6 flex justify-center">
            <Image
              src={LOGO_PATH}
              alt="Kaffee Krümel"
              width={140}
              height={140}
              className="h-24 w-auto object-contain sm:h-28"
              priority
            />
          </div>

          <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Admin Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 rounded-xl pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl bg-[#00562C] text-base font-semibold hover:bg-[#004522]"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
