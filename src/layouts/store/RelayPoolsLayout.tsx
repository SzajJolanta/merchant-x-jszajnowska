import React, { useEffect, useState } from "react";
import { useRelayStore } from "@/stores/useRelayStore";
import { getNdk } from "@/services/ndkService";

const RelayPoolsLayout: React.FC = () => {
    const {
        relays,
        addRelay,
        removeRelay,
        resetRelays,
        loadRelaysFromNostr,
        publishRelayList,
    } = useRelayStore();

    const [input, setInput] = useState("");

    // Load user's relays from Kind 10002 on mount
    useEffect(() => {
        (async () => {
            const ndk = await getNdk();
            const user = await ndk.signer?.user();
            if (user) {
                await loadRelaysFromNostr(user.pubkey);
            }
        })();
    }, [loadRelaysFromNostr]);

    const handleAdd = () => {
        try {
            const url = new URL(input.trim());
            addRelay(url.href);
            setInput("");
        } catch {
            alert("Invalid relay URL");
        }
    };

    const handleSyncFromNostr = async () => {
        const ndk = await getNdk();
        const user = await ndk.signer?.user();
        if (user) {
            await loadRelaysFromNostr(user.pubkey);
            alert("✅ Synced relays from Nostr (Kind 10002)");
        }
    };

    const handlePublish = async () => {
        try {
            await publishRelayList();
            alert("✅ Relays published to Nostr (Kind 10002)");
        } catch (err) {
            console.error(err);
            alert("❌ Failed to publish relays");
        }
    };

    return (
        <section className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Relay Pool</h1>
            <p className="text-gray-500 mb-4">
                Manage your preferred Nostr relays. These are used across the app for publishing and fetching events.
            </p>

            <ul className="space-y-2 mb-6">
                {relays.map((url) => (
                    <li key={url} className="flex justify-between items-center border px-3 py-2 rounded">
                        <span>{url}</span>
                        <button
                            onClick={() => removeRelay(url)}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="wss://relay.example.com"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                />
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Add Relay
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <button
                    onClick={resetRelays}
                    className="text-gray-600 hover:underline"
                >
                    Reset to default relays
                </button>

                <button
                    onClick={handleSyncFromNostr}
                    className="text-indigo-600 hover:underline"
                >
                    Sync from Nostr (Kind 10002)
                </button>

                <button
                    onClick={handlePublish}
                    className="text-green-600 hover:underline"
                >
                    Publish to Nostr (Kind 10002)
                </button>
            </div>
        </section>
    );
};

export default RelayPoolsLayout;
