"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import clsx from "clsx";
import { apiFetch } from "@/lib/api";
import { buildErrorMap } from "@/lib/errorMap";
import { showToastError, showToastSuccess } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";

const Signup = () => {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      router.push("/");
    }
  }, [accessToken]);

  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      const res = await apiFetch(`/auth/register`, {
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
        showToastError(data.error || "Something went wrong.");
        return;
      }

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      showToastSuccess(data.message, "top-center", 7000);
      router.push("/auth/signin");
    } catch (error) {
      showToastError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center h-screen">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Registration</CardTitle>
          <CardDescription>
            Please fill in all the input to continue.
          </CardDescription>
          <CardAction>
            <Link href="/auth/signin">Sign In</Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-2 gap-x-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      disabled={loading}
                      autoFocus
                      id="username"
                      type="username"
                      name="username"
                      placeholder="username"
                      value={formData.username}
                      onChange={handleOnChange}
                      className={clsx(
                        errors.username?.length && "border-2 border-rose-500"
                      )}
                    />
                    {errors.username?.map((msg, i) => (
                      <p
                        className="text-xs font-semibold text-rose-500 tracking-tight"
                        key={i}
                      >{`- ${msg}`}</p>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      disabled={loading}
                      id="email"
                      type="email"
                      name="email"
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
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  disabled={loading}
                  id="password"
                  type="password"
                  name="password"
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                </div>
                <Input
                  disabled={loading}
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleOnChange}
                  className={clsx(
                    errors.confirmPassword?.length && "border-2 border-rose-500"
                  )}
                />
                {errors.confirmPassword?.map((msg, i) => (
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
                  "Sign Up"
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

export default Signup;
