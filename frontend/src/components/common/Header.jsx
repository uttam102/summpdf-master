import { FileText, Upload } from "lucide-react";
import NavLink from "./NavLink";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container flex items-center justify-between py-4 lg:px-8 px-4 mx-auto">
        <div className="flex lg:flex-1">
          <Link to="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105">
            <div className="p-1.5 bg-rose-500 rounded-lg shadow-lg shadow-rose-200">
              <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="font-black lg:text-2xl text-slate-900 tracking-tight">
              Summ<span className="text-rose-600">PDF</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex lg:justify-center gap-8 items-center">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
          <SignedIn>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </SignedIn>
          <NavLink href="/pricing">Pricing</NavLink>
        </div>

        <div className="flex lg:justify-end lg:flex-1 items-center gap-4">
          <SignedIn>
            <Link
              to="/upload"
              className="hidden lg:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <Upload size={16} />
              New Summary
            </Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 border-2 border-rose-500 shadow-md hover:scale-105 transition-transform"
                }
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-zinc-900 to-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:from-rose-600 hover:to-zinc-900 shadow-xl shadow-rose-200/50 transition-all active:scale-95 cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-zinc-900 to-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:from-rose-600 hover:to-zinc-900 shadow-xl shadow-rose-200/50 transition-all active:scale-95 cursor-pointer">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}

export default Header;
