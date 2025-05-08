"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to Science Video Creator</h1>
        <p className="mt-4 text-lg text-gray-600">
          Create engaging science videos with AI
        </p>
        {status === "loading" ? (
          <div className="mt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        ) : session ? (
          <div className="mt-8">
            <p className="mb-4">Welcome back, {session.user?.name}!</p>
            <Link
              href="/dashboard"
              className="inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <Link
              href="/auth/signin"
              className="inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
