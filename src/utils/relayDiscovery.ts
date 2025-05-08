import { getNdk } from "@/services/ndkService";
import { PUBLIC_FALLBACK_RELAYS } from "@/utils/constants";
import { NDKEvent } from "@nostr-dev-kit/ndk";

export const loadUserProfileWithRelayDiscovery = async (
  pubkey: string
): Promise<NDKEvent | null> => {
  const ndk = await getNdk();

  // Step 1: Try to fetch relays from Kind 10002
  const relayEvent = await ndk.fetchEvent({
    kinds: [10002],
    authors: [pubkey],
  });

  let relays = PUBLIC_FALLBACK_RELAYS;

  if (relayEvent) {
    const relayUrls = relayEvent.tags
      .filter((tag) => tag[0] === "r" && typeof tag[1] === "string")
      .map((tag) => tag[1]);

    if (relayUrls.length > 0) {
      relays = relayUrls;
    }
  }

  // Step 2: Fetch Kind 0 (profile) from preferred or fallback relays
  const events = await ndk.fetchEvents({ kinds: [0], authors: [pubkey] }, relays);

  if (!events || events.size === 0) return null;

  const sorted = Array.from(events).sort(
    (a, b) => (b.created_at ?? 0) - (a.created_at ?? 0)
  );

  return sorted[0];
};
