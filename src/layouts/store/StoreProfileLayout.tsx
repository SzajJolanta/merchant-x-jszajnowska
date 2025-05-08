import React, { useEffect, useState } from "react";
import { useStoreProfileStore } from "@/stores/useStoreProfileStore";
import { getNdk } from "@/services/ndkService";
import { useLocation } from "wouter";

const StoreProfileLayout: React.FC = () => {
    const { profile, fetchProfile } = useStoreProfileStore();
    const [, navigate] = useLocation();

    useEffect(() => {
        (async () => {
            const ndk = await getNdk();
            const user = await ndk.signer?.user();
            if (user) {
                fetchProfile(user.pubkey);
            }
        })();
    }, [fetchProfile]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Banner + Avatar */}
            <div className="relative">
                {profile?.banner ? (
                    <img
                        src={profile.banner}
                        alt="Banner"
                        className="w-full h-48 object-cover rounded-md"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-md" />
                )}

                <div className="absolute -bottom-10 left-4">
                    {profile?.picture ? (
                        <img
                            src={profile.picture}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full border-4 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-white shadow-md" />
                    )}
                </div>
            </div>

            {/* Profile Info */}
            <div className="pt-12 space-y-4">
                {[
                    { label: "Store Name", value: profile?.name },
                    { label: "Display Name", value: profile?.display_name },
                    { label: "Website", value: profile?.website },
                    { label: "NIP-05", value: profile?.nip05 },
                    { label: "Lightning Address", value: profile?.lud16 },
                ].map((field) => (
                    <div key={field.label}>
                        <label className="block text-sm font-medium text-gray-600">
                            {field.label}
                        </label>
                        <p className="text-gray-800">{field.value || "—"}</p>
                    </div>
                ))}

                <div>
                    <label className="block text-sm font-medium text-gray-600">About</label>
                    <p className="text-gray-800 whitespace-pre-line">
                        {profile?.about || "—"}
                    </p>
                </div>

                {Array.isArray(profile?.tags) && profile.tags.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Tags
                        </label>
                        <ul className="text-gray-700 text-sm mt-1 space-y-1">
                            {profile.tags.map((tag, index) => (
                                <li key={index}>
                                    <code>[{tag.map(t => `"${t}"`).join(", ")}]</code>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button
                onClick={() => navigate("/store/edit")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
                Edit Profile
            </button>
        </div>
    );
};

export default StoreProfileLayout;
