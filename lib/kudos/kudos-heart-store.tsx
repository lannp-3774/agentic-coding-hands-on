"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { likeKudos, unlikeKudos, type HeartActionResult } from "./kudos-heart-actions";

/** What every heart button of one kudos shows (FR-404: one state per kudos). */
export type KudosHeartState = { liked: boolean; count: number; pending: boolean };

/** A card's server values (`likedByMe`, `likeCount`) used to register the kudos. */
export type KudosHeartSeed = { liked: boolean; count: number };

/** `ignored`: a request for this kudos is already in flight (DEC-002); nothing changed. */
export type KudosHeartToggleResult = HeartActionResult | { status: "ignored" };

export type KudosHeart = KudosHeartState & {
  /** Like when gray, unlike when red. Never rejects; non-`ok` results are already reverted. */
  toggle: () => Promise<KudosHeartToggleResult>;
};

type Listener = () => void;
type HeartStore = ReturnType<typeof createHeartStore>;

const ERROR: HeartActionResult = { status: "error" };

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/** The action reply crosses the network: anything unexpected counts as an error. */
function toHeartResult(reply: unknown): HeartActionResult {
  if (typeof reply !== "object" || reply === null) return ERROR;
  const { status, liked, likeCount } = reply as Record<string, unknown>;
  if (status === "ok") {
    return typeof liked === "boolean" && isCount(likeCount) ? { status, liked, likeCount } : ERROR;
  }
  return status === "unauthenticated" || status === "forbidden" ? { status } : ERROR;
}

/**
 * Per-kudos heart state for one page. Entries are immutable snapshots
 * (`useSyncExternalStore` compares by identity); listeners are per kudos id.
 */
function createHeartStore() {
  const entries = new Map<string, KudosHeartState>();
  /** Last server seed seen per kudos, so the same (stale) seed is never applied twice. */
  const seeds = new Map<string, KudosHeartSeed>();
  const listeners = new Map<string, Set<Listener>>();

  function write(kudosId: string, next: KudosHeartState): void {
    entries.set(kudosId, next);
    listeners.get(kudosId)?.forEach((listener) => listener());
  }

  function normalize(seed: KudosHeartSeed): KudosHeartSeed {
    return { liked: seed.liked === true, count: isCount(seed.count) ? seed.count : 0 };
  }

  return {
    /**
     * The kudos' current state, registered from `seed` on first read: the first
     * registration wins (every card of one render carries the same server value,
     * and a later card must not undo a like made on the page).
     */
    read(kudosId: string, seed: KudosHeartSeed): KudosHeartState {
      let entry = entries.get(kudosId);
      if (!entry) {
        const fresh = normalize(seed);
        seeds.set(kudosId, fresh);
        entry = { ...fresh, pending: false };
        entries.set(kudosId, entry);
      }
      return entry;
    },

    /**
     * Takes a fresh server value (a filter change re-reads the cards). Adopted
     * only when it differs from the last seed seen and no request is in flight;
     * a seed seen while pending is still remembered so it never clobbers the
     * reconciled value later. Call from an effect, not while rendering.
     */
    sync(kudosId: string, seed: KudosHeartSeed): void {
      const next = normalize(seed);
      const last = seeds.get(kudosId);
      if (last && last.liked === next.liked && last.count === next.count) return;
      seeds.set(kudosId, next);

      const entry = entries.get(kudosId);
      if (!entry || entry.pending) return;
      if (entry.liked === next.liked && entry.count === next.count) return;
      write(kudosId, { ...next, pending: false });
    },

    subscribe(kudosId: string, listener: Listener): () => void {
      const set = listeners.get(kudosId) ?? new Set<Listener>();
      listeners.set(kudosId, set);
      set.add(listener);
      return () => {
        set.delete(listener);
        if (set.size === 0) listeners.delete(kudosId);
      };
    },

    /**
     * Optimistic flip, then reconcile with the server (ok). On failure the entry
     * goes back to the pre-click snapshot, or to a fresher server seed that
     * `sync` remembered while the request was pending. Only the optimistic value
     * this request wrote is rolled back; anything newer is kept.
     */
    async toggle(kudosId: string): Promise<KudosHeartToggleResult> {
      const before = entries.get(kudosId);
      if (!before || before.pending) return { status: "ignored" };
      const seedAtClick = seeds.get(kudosId);

      const like = !before.liked;
      const optimistic = { liked: like, count: Math.max(0, before.count + (like ? 1 : -1)), pending: true };
      write(kudosId, optimistic);

      let result: HeartActionResult;
      try {
        result = toHeartResult(await (like ? likeKudos(kudosId) : unlikeKudos(kudosId)));
      } catch (cause) {
        // Network failure, aborted request or a stale action id after a deploy.
        console.error(`[kudos-hearts] ${like ? "like" : "unlike"} request failed: ${cause instanceof Error ? cause.message : String(cause)}`);
        result = ERROR;
      }

      if (result.status === "ok") {
        write(kudosId, { liked: result.liked, count: result.likeCount, pending: false });
      } else if (entries.get(kudosId) === optimistic) {
        // `sync` stores a new seed object only when the value changed.
        const seed = seeds.get(kudosId);
        const fresher = seed !== undefined && seed !== seedAtClick ? seed : before;
        write(kudosId, { liked: fresher.liked, count: fresher.count, pending: false });
      }
      return result;
    },
  };
}

const KudosHeartContext = createContext<HeartStore | null>(null);

/**
 * Shares heart state between every card of the page (FR-404): mounted once by
 * the page shell around Highlight and All Kudos (F006). It is not keyed by the
 * filters: new server values reach it through `useKudosHeart`'s `initial`.
 */
export function KudosHeartProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createHeartStore);
  return <KudosHeartContext value={store}>{children}</KudosHeartContext>;
}

/**
 * Heart state of one kudos plus its `toggle` (F007 A3). `initial` is the
 * card's server value: it registers the kudos the first time it is seen, and a
 * later different value (fresh data after a filter change) replaces the shown
 * state unless a request is in flight.
 */
export function useKudosHeart(kudosId: string, initial: KudosHeartSeed): KudosHeart {
  const store = useContext(KudosHeartContext);
  if (!store) throw new Error("useKudosHeart must be used inside <KudosHeartProvider>");

  const { liked: seedLiked, count: seedCount } = initial;
  // Layout effect: the fresh value lands before paint, so no frame shows the stale one.
  useLayoutEffect(() => {
    store.sync(kudosId, { liked: seedLiked, count: seedCount });
  }, [store, kudosId, seedLiked, seedCount]);
  const subscribe = useCallback((listener: Listener) => store.subscribe(kudosId, listener), [store, kudosId]);
  const getSnapshot = useCallback(
    () => store.read(kudosId, { liked: seedLiked, count: seedCount }),
    [store, kudosId, seedLiked, seedCount],
  );
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const toggle = useCallback(() => store.toggle(kudosId), [store, kudosId]);

  return { liked: state.liked, count: state.count, pending: state.pending, toggle };
}
