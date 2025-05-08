import { create } from "zustand";
import { getNdk } from "@/services/ndkService";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { loadUserProfileWithRelayDiscovery } from "@/utils/relayDiscovery";

type StoreProfile = {
    name?: string;
    display_name?: string;
    about?: string;
    website?: string;
    picture?: string;
    banner?: string;
    nip05?: string;
    lud16?: string;
    tags?: string[][] | string;
};

type StoreProfileStore = {
    profile: StoreProfile | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: (pubkey: string) => Promise<void>;
    updateProfile: (pubkey: string, data: StoreProfile) => Promise<void>;
    publishTestProfile: () => Promise<void>;
};

export const useStoreProfileStore = create<StoreProfileStore>((set) => ({
    profile: null,
    isLoading: false,
    error: null,

    fetchProfile: async (pubkey) => {
        try {
          set({ isLoading: true, error: null });
      
          const event = await loadUserProfileWithRelayDiscovery(pubkey);
          if (!event) {
            set({ isLoading: false, profile: null });
            return;
          }
      
          const parsed = JSON.parse(event.content);
          set({ profile: { ...parsed }, isLoading: false });
        } catch (err) {
          console.error("Failed to load profile", err);
          set({ error: "Failed to fetch profile", isLoading: false });
        }
      },

    updateProfile: async (pubkey, updates) => {
        try {
            const ndk = await getNdk();

            const existing = await loadUserProfileWithRelayDiscovery(pubkey);
            let previousData: Record<string, any> = {};
            let tags: string[][] = existing?.tags ?? [];

            if (existing) {
                try {
                    previousData = JSON.parse(existing.content);
                } catch (e) {
                    console.warn("Could not parse previous Kind 0 JSON");
                }
            }

            if (typeof updates.tags === "string") {
                try {
                    const parsed = JSON.parse(updates.tags);
                    if (Array.isArray(parsed) && parsed.every((t) => Array.isArray(t))) {
                        tags = parsed;
                    } else {
                        console.warn("Invalid tags format (must be string[][])");
                    }
                } catch {
                    console.warn("Failed to parse tags string");
                }
            }

            const merged = {
                ...previousData,
                ...updates,
            };
            const newEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey,
                content: JSON.stringify(merged),
                tags,
                created_at: Math.floor(Date.now() / 1000),
            });
            console.log("[debug] merged profile before publish", merged);
            await newEvent.sign();
            await newEvent.publish();
            set({ profile: merged });
        } catch (err: any) {
            console.error("Error updating store profile:", err);
            set({ error: err.message || "Failed to update profile" });
        }
    },

    publishTestProfile: async () => {
        const ndk = await getNdk();
        const user = await ndk.signer?.user();
        if (!user) return;

        const event = new NDKEvent(ndk);
        event.kind = 0;
        event.pubkey = user.pubkey;
        event.created_at = Math.floor(Date.now() / 1000);
        event.tags = [["test", "true"]];
        event.content = JSON.stringify({
            name: "Local Test Store",
            about: "This is a local test profile.",
            website: "http://localhost",
        });

        await event.sign();
        await event.publish();

        console.log("✅ Test Kind 0 event published");
    },
}));