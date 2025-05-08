import { create } from "zustand";
import { getNdk } from "@/services/ndkService";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { DEFAULT_RELAYS } from "@/utils/constants";

type RelayStore = {
  relays: string[];
  addRelay: (url: string) => void;
  removeRelay: (url: string) => void;
  resetRelays: () => void;
  loadRelaysFromNostr: (pubkey: string) => Promise<void>;
  publishRelayList: () => Promise<void>;
};

const LOCAL_KEY = "nostr-relay-pool";

export const useRelayStore = create<RelayStore>((set, get) => {
  const saved = localStorage.getItem(LOCAL_KEY);
  const initial = saved ? JSON.parse(saved) : DEFAULT_RELAYS;

  const persist = (relays: string[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(relays));
  };

  return {
    relays: initial,

    addRelay: (url: string) => {
      if (!url.startsWith("ws")) return;
      set((state) => {
        if (!state.relays.includes(url)) {
          const updated = [...state.relays, url];
          persist(updated);
          return { relays: updated };
        }
        return state;
      });
    },

    removeRelay: (url: string) => {
      set((state) => {
        const updated = state.relays.filter((r) => r !== url);
        persist(updated);
        return { relays: updated };
      });
    },

    resetRelays: () => {
      persist(DEFAULT_RELAYS);
      set({ relays: [...DEFAULT_RELAYS] });
    },

    loadRelaysFromNostr: async (pubkey) => {
      const ndk = await getNdk();
      const event = await ndk.fetchEvent({
        kinds: [10002],
        authors: [pubkey],
      });

      if (event) {
        const relayUrls = event.tags
          .filter((tag) => tag[0] === "r" && typeof tag[1] === "string")
          .map((tag) => tag[1]);

        persist(relayUrls);
        set({ relays: relayUrls });

        console.log(`✅ Loaded ${relayUrls.length} relays from Kind 10002 for pubkey: ${pubkey}`, relayUrls);
      } else {
        console.warn(`⚠️ No Kind 10002 event found for pubkey: ${pubkey}`);
      }
    },

    publishRelayList: async () => {
      const ndk = await getNdk();
      const signer = await ndk.signer?.user();
      if (!signer) throw new Error("User not authenticated");

      const relays = get().relays;
      const tags = relays.map((url) => ["r", url]);

      const event = new NDKEvent(ndk);
      event.kind = 10002;
      event.pubkey = signer.pubkey;
      event.created_at = Math.floor(Date.now() / 1000);
      event.tags = tags;
      event.content = "";

      await event.sign();
      await event.publish();

      console.log("✅ Published Kind 10002 relay list.");
    },
  };
});
