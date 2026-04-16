import React from "react";
import BgGradient from "@/components/common/BgGradient";
import PricingSection from "@/components/Home/PricingSection";
import CTASection from "@/components/Home/CTASection";

export default function Pricing() {
    return (
        <div className="relative min-h-screen pt-20">
            <BgGradient className="from-rose-400 via-rose-300 to-orange-200" />
            <div className="container mx-auto px-4">
                <PricingSection />
                <div className="pb-20">
                    <CTASection />
                </div>
            </div>
        </div>
    );
}
