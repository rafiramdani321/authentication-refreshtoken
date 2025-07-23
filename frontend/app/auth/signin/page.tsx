"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { showToastError } from "@/lib/toast";

import clsx from "clsx";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { buildErrorMap } from "@/lib/errorMap";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Signin = () => {
  const router = useRouter();
  const { setAccessToken, accessToken } = useAuthStore();

  React.useEffect(() => {
    if (accessToken) {
      router.push("/");
    }
  }, [accessToken]);

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof typeof formData, string[]>>
  >({});
  const [loading, setLoading] = React.useState(false);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiFetch(`/auth/login`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          setErrors(buildErrorMap<keyof typeof formData>(data.details));
        }
        showToastError(data.error || "Something went wrong");
        return;
      }

      setAccessToken(data.data.accessToken);

      setFormData({ email: "", password: "" });
      setErrors({});
      router.push("/");
    } catch (error: any) {
      console.log(error);
      showToastError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Link href="/auth/signup">Sign Up</Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  disabled={loading}
                  autoFocus
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleOnChange}
                  className={clsx(
                    errors.email?.length && "border-2 border-rose-500"
                  )}
                />
                {errors.email?.map((msg, i) => (
                  <p
                    className="text-xs font-semibold text-rose-500 tracking-tight"
                    key={i}
                  >{`- ${msg}`}</p>
                ))}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  disabled={loading}
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleOnChange}
                  className={clsx(
                    errors.password?.length && "border-2 border-rose-500"
                  )}
                />
                {errors.password?.map((msg, i) => (
                  <p
                    className="text-xs font-semibold text-rose-500 tracking-tight"
                    key={i}
                  >{`- ${msg}`}</p>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <Button disabled={loading} type="submit" className="w-full">
                {!loading ? (
                  "Sign In"
                ) : (
                  <LoaderCircle className="animate-spin" />
                )}
              </Button>
              <Button disabled={loading} variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signin;
