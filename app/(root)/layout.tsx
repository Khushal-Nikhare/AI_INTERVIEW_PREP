import { getCurrentUser } from "@/lib/actions/auth.action";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import React from "react";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
