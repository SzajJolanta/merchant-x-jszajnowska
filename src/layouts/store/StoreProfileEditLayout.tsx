import React, { useEffect, useState } from "react";
import { useStoreProfileStore } from "@/stores/useStoreProfileStore";
import { getNdk } from "@/services/ndkService";
import { useLocation } from "wouter";

const StoreProfileEditLayout: React.FC = () => {
    const { profile, fetchProfile, updateProfile, publishTestProfile, } = useStoreProfileStore();

    const [form, setForm] = useState({
        name: "",
        display_name: "",
        about: "",
        tags: "",
        website: "",
        nip05: "",
        lud16: "",
        picture: "",
        banner: "",
    });

    const [pubkey, setPubkey] = useState<string | null>(null);
    const [editingBanner, setEditingBanner] = useState(false);
    const [editingAvatar, setEditingAvatar] = useState(false);
    const [, navigate] = useLocation();

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

    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name ?? "",
                display_name: profile.display_name ?? "",
                about: profile.about ?? "",
                tags: profile.tags ? JSON.stringify(profile.tags, null, 2) : "",
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
        navigate("/store");
    };

    const handleTest = async () => {
        if (!pubkey) return;
        await publishTestProfile();
        navigate("/store");
    };

    const handleCancel = () => {
        if (pubkey) {
            fetchProfile(pubkey);
            navigate("/store");
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Banner + Avatar */}
            <div className="relative">
                {form.banner ? (
                    <img
                        src={form.banner}
                        alt="Banner"
                        className="w-full h-48 object-cover rounded-md"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-md" />
                )}
                <button
                    onClick={() => setEditingBanner(!editingBanner)}
                    className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                    title="Edit banner"
                >
                    ✏️
                </button>

                <div className="absolute -bottom-10 left-4">
                    {form.picture ? (
                        <img
                            src={form.picture}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full border-4 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-white shadow-md" />
                    )}
                    <button
                        onClick={() => setEditingAvatar(!editingAvatar)}
                        className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                        title="Edit avatar"
                    >
                        ✏️
                    </button>
                </div>
            </div>

            <div className="mt-20">
                {editingBanner && (
                    <div>
                        <p>Banner URL</p>
                        <input
                            type="text"
                            name="banner"
                            placeholder="Banner URL"
                            value={form.banner}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                )}

                {editingAvatar && (
                    <div className="mt-2">
                        <p>Avatar URL</p>
                        <input
                            type="text"
                            name="picture"
                            placeholder="Avatar URL"
                            value={form.picture}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-12">
                {[
                    { label: "Store Name", name: "name" },
                    { label: "Display Name", name: "display_name" },
                    { label: "Website", name: "website" },
                    { label: "NIP-05", name: "nip05" },
                    { label: "Lightning Address", name: "lud16" },
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

                <div>
                    <label className="block font-medium text-sm mb-1">Tags</label>
                    <textarea
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleSubmit}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Save Changes
                </button>
                <button
                    onClick={handleCancel}
                    className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    onClick={handleTest}
                    className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                    Test Profile Local
                </button>
            </div>
        </div>
    );
};

export default StoreProfileEditLayout;
