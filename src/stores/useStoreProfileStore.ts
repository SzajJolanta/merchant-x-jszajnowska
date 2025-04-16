import { create } from "zustand";
import { getNdk } from "@/services/ndkService";
import { NDKEvent, NDKFilter, NostrEvent } from "@nostr-dev-kit/ndk";

type StoreProfile = {
    name?: string;
    display_name?: string;
    about?: string;
    website?: string;
    picture?: string;
    banner?: string;
    nip05?: string;
    lud16?: string;
};

type StoreProfileStore = {
    profile: StoreProfile | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: (pubkey: string) => Promise<void>;
    updateProfile: (pubkey: string, data: StoreProfile) => Promise<void>;
};

export const useStoreProfileStore = create<StoreProfileStore>((set) => ({
    profile: null,
    isLoading: false,
    error: null,

    fetchProfile: async (pubkey: string) => {
        set({ isLoading: true, error: null });

        try {
            const ndk = await getNdk();

            const filter: NDKFilter = {
                kinds: [0],
                authors: [pubkey],
                limit: 1,
            };

            const events = await ndk.fetchEvents(filter);
            const [event] = Array.from(events);

            if (event?.content) {
                const parsed = JSON.parse(event.content);
                set({ profile: parsed, isLoading: false });
            } else {
                set({ profile: null, isLoading: false });
            }
        } catch (err: any) {
            console.error("Error fetching store profile:", err);
            set({ error: err.message || "Unknown error", isLoading: false });
        }
    },

    updateProfile: async (pubkey: string, data: StoreProfile) => {
        try {
            const ndk = await getNdk();

            const rawEvent: NostrEvent = {
                kind: 0,
                pubkey,
                created_at: Math.floor(Date.now() / 1000),
                content: JSON.stringify(data),
                tags: [],
            };

            const ndkEvent = new NDKEvent(ndk, rawEvent);
            await ndkEvent.sign(); // Sign with current user keys
            await ndkEvent.publish();

            set({ profile: data });
        } catch (err: any) {
            console.error("Error updating store profile:", err);
            set({ error: err.message || "Failed to save profile" });
        }
    },
}));
