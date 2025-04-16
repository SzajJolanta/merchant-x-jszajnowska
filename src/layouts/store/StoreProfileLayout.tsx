import React, { useEffect, useState } from "react";
import { useStoreProfileStore } from "@/stores/useStoreProfileStore";
import { getNdk } from "@/services/ndkService";

const StoreProfileLayout: React.FC = () => {
    const { profile, fetchProfile, updateProfile } = useStoreProfileStore();

    const [form, setForm] = useState({
        name: "",
        display_name: "",
        about: "",
        website: "",
        nip05: "",
        lud16: "",
        picture: "",
        banner: "",
    });

    const [pubkey, setPubkey] = useState<string | null>(null);

    // Get the current user's pubkey on mount
    useEffect(() => {
        (async () => {
            const ndk = await getNdk();
            const user = await ndk.signer?.user();
            if (user) {
                setPubkey(user.pubkey);
                fetchProfile(user.pubkey);
            }
        })();
    }, [fetchProfile]);

    // Sync form when profile is loaded
    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name ?? "",
                display_name: profile.display_name ?? "",
                about: profile.about ?? "",
                website: profile.website ?? "",
                nip05: profile.nip05 ?? "",
                lud16: profile.lud16 ?? "",
                picture: profile.picture ?? "",
                banner: profile.banner ?? "",
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!pubkey) return;
        await updateProfile(pubkey, form);
    };

    const handleCancel = () => {
        if (pubkey) fetchProfile(pubkey);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold">Store Profile</h1>

            {/* BANNER PREVIEW */}
            {form.banner && (
                <div className="mb-4">
                    <label className="block font-medium text-sm mb-1">Banner Preview</label>
                    <img
                        src={form.banner}
                        alt="Banner Preview"
                        className="w-full h-32 object-cover rounded-md border"
                    />
                </div>
            )}

            {/* PROFILE PICTURE PREVIEW */}
            {form.picture && (
                <div className="mb-4">
                    <label className="block font-medium text-sm mb-1">Profile Picture Preview</label>
                    <img
                        src={form.picture}
                        alt="Profile Preview"
                        className="w-20 h-20 object-cover rounded-full border"
                    />
                </div>
            )}

            <div className="space-y-4">
                {[
                    { label: "Store Name", name: "name" },
                    { label: "Display Name", name: "display_name" },
                    { label: "Website", name: "website" },
                    { label: "NIP-05", name: "nip05" },
                    { label: "Lightning Address", name: "lud16" },
                    { label: "Profile Picture URL", name: "picture" },
                    { label: "Banner URL", name: "banner" },
                ].map((field) => (
                    <div key={field.name}>
                        <label className="block font-medium text-sm mb-1">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            name={field.name}
                            value={(form as any)[field.name]}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>
                ))}

                <div>
                    <label className="block font-medium text-sm mb-1">About (Bio)</label>
                    <textarea
                        name="about"
                        value={form.about}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleSubmit}
                    disabled={!pubkey}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Save Changes
                </button>
                <button
                    onClick={handleCancel}
                    disabled={!pubkey}
                    className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default StoreProfileLayout;
