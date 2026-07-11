<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
=======
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Logo from "../components/ui/Logo";
import { loginUser } from "../firebase/auth";
<<<<<<< HEAD
import useAuth from "../hooks/useAuth";
import { getFirebaseErrorMessage } from "../utils/firebaseErrorMessage";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading: authLoading } = useAuth();

  const searchParams = new URLSearchParams(location.search);

  const redirectPath =
    searchParams.get("redirect") ||
    sessionStorage.getItem("redirectAfterLogin") ||
    "/dashboard";
=======

export default function LoginPage() {
  const navigate = useNavigate();
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  useEffect(() => {
    if (!authLoading && currentUser) {
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath, { replace: true });
    }
  }, [authLoading, currentUser, navigate, redirectPath]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

=======
  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
    setError("");

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email, password);

<<<<<<< HEAD
      // Do not navigate here.
      // The useEffect above will redirect after AuthContext receives currentUser.
    } catch (error: unknown) {
      console.error("LOGIN ERROR:", error);
      setError(getFirebaseErrorMessage(error, "Login failed. Please try again."));
=======
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError(error.message || "Login failed.");
      }
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>

          <h1 className="mt-8 text-3xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-600">
            Login to continue your Medical Elites learning journey.
          </p>
        </div>

        {error && (
<<<<<<< HEAD
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
=======
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
<<<<<<< HEAD
            <label className="mb-2 block font-medium text-slate-700">
              Email Address
            </label>
=======
            <label className="mb-2 block font-medium">Email Address</label>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
<<<<<<< HEAD
              onChange={(event) => setEmail(event.target.value)}
=======
              onChange={(e) => setEmail(e.target.value)}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              required
            />
          </div>

          <div>
<<<<<<< HEAD
            <label className="mb-2 block font-medium text-slate-700">
              Password
            </label>
=======
            <label className="mb-2 block font-medium">Password</label>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
<<<<<<< HEAD
              onChange={(event) => setPassword(event.target.value)}
=======
              onChange={(e) => setPassword(e.target.value)}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
<<<<<<< HEAD
          Don&apos;t have an account?{" "}
=======
          Don't have an account?{" "}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
          <Link
            to="/register"
            className="font-semibold text-blue-700 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </Card>
    </main>
  );
}