import React from "react";
import BgGradient from "@/components/common/BgGradient";
import UploadForm from "@/components/upload/UploadForm";
import UploadHeader from "@/components/upload/UploadHeader";

export default function Upload() {
    return (
        <section className="min-h-screen relative overflow-hidden bg-slate-50">
            <BgGradient className="from-rose-100 via-teal-50 to-white" />

            <div className="container mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 relative z-10">
                <div className="flex flex-col gap-12 items-center">
                    <UploadHeader />
                    <UploadForm />
                </div>
            </div>

            {/* Decorative patterns */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-200/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-200/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />
        </section>
    );
}
