import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 9,
    description: "Perfect for occasional use",
    items: [
      "5 PFD summaries per month",
      "Standard processing speed",
      "Email support",
    ],
    paymentLink: "",
    priceId: "",
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    description: "For professionals and teams",
    items: [
      "Unlimited PDF summaries",
      "Priority processing",
      "24/7 support",
      "Markdown export",
    ],
    paymentLink: "",
    priceId: "",
  },
];

const PricingCard = ({
  name,
  price,
  description,
  items,
  id,
  paymentLink,
}) => {
  return (
    <div className="relative w-full max-w-lg hover:scale-105 hover:transition-all duration-300">
      <div
        className={cn(
          "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 border-[1px] border-gray-500/20 rounded-2xl",
          id === "pro" && "border-rose-500 gap-5 border-2"
        )}
      >
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-lg lg:text-xl font-bold capitalize">{name}</p>
            <p className="text-base-content/80 mt-2">{description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <p className="text-5xl tracking-tight font-extrabold">${price}</p>
          <div className="flex flex-col justify-end mb-[4px]">
            <p className="text-xs uppercase font-semibold">USD</p>
            <p className="text-xs">months</p>
          </div>
        </div>
        <div className="space-y-2.5 leading-relaxed text-base flex-1">
          <ul className="list-none p-0 space-y-2.5">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check size={18} className="text-rose-500" />
                <span className="text-slate-600 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 flex justify-center w-full">
          <Link
            to={paymentLink || "#"}
            className={cn(
              "w-full rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-rose-800 to-rose-500 hover:from-rose-500 hover:to-rose-800 text-white border-0 py-3 font-bold no-underline transition-all shadow-lg shadow-rose-200"
            )}
          >
            Buy Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

function PricingSection() {
  return (
    <section className="relative overflow-hidden scroll-mt-20" id="pricing">
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
        <div className="flex flex-col items-center justify-center w-full pb-12">
          <h2 className="uppercase font-black text-xs tracking-[0.2em] mb-4 text-rose-500">
            Pricing
          </h2>
          <h3 className="text-3xl lg:text-5xl font-black text-slate-900 text-center tracking-tight">
            Simple plans for massive insights
          </h3>
        </div>
        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.id} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;

