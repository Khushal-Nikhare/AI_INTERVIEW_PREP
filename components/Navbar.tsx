"use client";

import { signOut } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, PlusCircle, CheckSquare, Sparkles, ChevronDown } from "lucide-react";

const Navbar = ({ user }: { user: { name: string; email: string } }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      setIsDropdownOpen(false);
      await signOut();
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { href: "/interview", label: "Mock Interview", icon: Sparkles },
    { href: "/aptitude", label: "Aptitude Tests", icon: CheckSquare },
    { href: "/interview/create", label: "Custom Interview", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Image src="/logo.svg" alt="logo" width={22} height={22} className="brightness-125" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-white leading-none">
              InterviewPrep
            </span>
            <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase mt-0.5">
              AI Career Suite
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoggingOut}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-lg border border-slate-800 bg-slate-900/70 hover:bg-slate-800/80 transition-all text-left disabled:opacity-50 cursor-pointer"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {user.email}
                </span>
              </div>
              <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3.5 py-2.5 border-b border-slate-800 sm:hidden">
                  <p className="text-xs font-medium text-slate-200">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>

                <div className="py-1 md:hidden">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      {label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-slate-800" />
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
