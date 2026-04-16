import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import BgGradient from "@/components/common/BgGradient";
import { Button } from "@/components/ui/button";
import { User, Mail, Briefcase, MapPin, TextQuote, Save, Loader2 } from "lucide-react";

export default function Profile() {
    const { user, isLoaded: userLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);

    const GO_BACKEND_URL = "http://localhost:8081";

    useEffect(() => {
        async function loadProfile() {
            if (!userLoaded || !user) return;

            try {
                const response = await fetch(`${GO_BACKEND_URL}/api/profile/${user.id}`);
                const data = await response.json();

                if (data && data.clerk_id) {
                    setProfile({
                        ...data,
                        email: user.emailAddresses[0].emailAddress,
                        imageUrl: user.imageUrl
                    });
                } else {
                    // Fallback to Clerk default data if no DB record yet
                    setProfile({
                        clerk_id: user.id,
                        full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                        email: user.emailAddresses[0].emailAddress,
                        imageUrl: user.imageUrl,
                        profession: "",
                        location: "",
                        bio: ""
                    });
                }
            } catch (error) {
                console.error("Failed to load profile from Go:", error);
                toast.error("Could not reach Go Backend");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [user, userLoaded]);

    async function handleSave(e) {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            const response = await fetch(`${GO_BACKEND_URL}/api/profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerk_id: user.id,
                    full_name: profile.full_name,
                    bio: profile.bio,
                    profession: profile.profession,
                    location: profile.location,
                }),
            });

            if (response.ok) {
                toast.success("Profile updated in Go database!");
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error("Failed to update profile in Go");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="relative min-h-screen pb-20">
            <BgGradient className="from-rose-100 via-orange-50 to-white" />

            <div className="container mx-auto px-4 pt-24 max-w-3xl">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-100 p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                        <div className="relative group">
                            <img
                                src={profile.imageUrl}
                                alt="Avatar"
                                className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white transition-transform group-hover:scale-105"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-xl shadow-lg">
                                <User size={20} />
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                {profile.full_name || "New User"}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500">
                                <Mail size={16} />
                                <span>{profile.email}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={profile.full_name || ""}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Profession</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={profile.profession || ""}
                                        onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                                        placeholder="e.g. Software Engineer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={profile.location || ""}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Short Bio</label>
                            <div className="relative group">
                                <TextQuote className="absolute left-4 top-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                                <textarea
                                    rows={4}
                                    value={profile.bio || ""}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full py-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-rose-200"
                        >
                            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            {saving ? "Saving to Database..." : "Save Profile Details"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
