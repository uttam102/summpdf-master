import { SignIn } from "@clerk/clerk-react";
import React from "react";
import BgGradient from "@/components/common/BgGradient";

export default function SignInPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center relative py-20">
            <BgGradient className="from-rose-50 via-white to-orange-50" />
            <div className="relative z-10">
                <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    appearance={{
                        elements: {
                            formButtonPrimary: "bg-rose-500 hover:bg-rose-600 border-none transition-all",
                            card: "shadow-2xl border border-rose-100 rounded-3xl",
                            headerTitle: "text-slate-900 font-black",
                            headerSubtitle: "text-slate-500 font-medium",
                        }
                    }}
                />
            </div>
        </div>
    );
}
