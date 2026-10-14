"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { KudosCard, KudosFilters, KudosPage } from "./kudos-card-types";
import { SENTINEL_ROOT_MARGIN_PX } from "./kudos-constants";

export type KudosListStatus = "idle" | "loading" | "error" | "done";

type ListState = { items: KudosCard[]; nextCursor: string | null; status: KudosListStatus };

type ListAction =
  | { type: "start" }
  | { type: "retry" }
  | { type: "success"; page: KudosPage }
  | { type: "failure" };

/** Appends a page, dropping cards already shown (BR-005); order is kept. */
function mergePage(items: KudosCard[], page: KudosPage): KudosCard[] {
  const seen = new Set(items.map((card) => card.id));
  const fresh = page.items.filter((card) => !seen.has(card.id));
  return fresh.length > 0 ? [...items, ...fresh] : items;
}

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "start":
      return state.status === "idle" ? { ...state, status: "loading" } : state;
    case "retry":
      return state.status === "error" ? { ...state, status: "loading" } : state;
    case "success": {
      if (state.status !== "loading") return state;
      // A cursor that did not move would refetch the same page forever: stop.
      const next = action.page.nextCursor === state.nextCursor ? null : action.page.nextCursor;
      return {
        items: mergePage(state.items, action.page),
        nextCursor: next,
        status: next === null ? "done" : "idle",
      };
    }
    case "failure":
      return state.status === "loading" ? { ...state, status: "error" } : state;
  }
}

function initialState(initial: KudosPage): ListState {
  return {
    items: initial.items,
    nextCursor: initial.nextCursor,
    status: initial.nextCursor === null ? "done" : "idle",
  };
}

function pageUrl(cursor: string, filters: KudosFilters): string {
  const params = new URLSearchParams({ cursor });
  if (filters.hashtag) params.set("hashtag", filters.hashtag);
  if (filters.department) params.set("department", filters.department);
  return `/api/kudos?${params.toString()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Shape check for the `/api/kudos` JSON; anything else counts as a failure. */
function isKudosPage(value: unknown): value is KudosPage {
  if (!isRecord(value) || !Array.isArray(value.items)) return false;
  const { nextCursor } = value;
  if (nextCursor !== null && (typeof nextCursor !== "string" || !/^\d+$/.test(nextCursor))) {
    return false;
  }
  return value.items.every(
    (card) =>
      isRecord(card) &&
      typeof card.id === "string" &&
      typeof card.seq === "string" &&
      // F010: an anonymous card has no sender; every card carries its parsed body.
      (card.sender === null || (isRecord(card.sender) && typeof card.sender.id === "string")) &&
      Array.isArray(card.bodyBlocks) &&
      isRecord(card.receiver),
  );
}

export type KudosInfiniteListOptions = {
  /** First page, rendered on the server. */
  initial: KudosPage;
  /** Filters of this list; a filter change remounts the list via `key`. */
  filters: KudosFilters;
  viewerSunnerId: string | null;
  /** Pure `withViewerFlags`, injected so this hook imports nothing server-side. */
  withViewerFlags: (card: KudosCard, viewerSunnerId: string | null) => KudosCard;
};

export type KudosInfiniteList = {
  items: KudosCard[];
  status: KudosListStatus;
  /** Attach to the element after the last card; it triggers the next page. */
  sentinelRef: (node: HTMLElement | null) => void;
  retry: () => void;
};

/**
 * Infinite scroll for All Kudos (F006 A6, FR-210, FR-215, BR-005, DEC-004).
 * Loads `GET /api/kudos?cursor=...` when the sentinel nears the viewport,
 * one page at a time. A failed load keeps the cards and shows `error` until
 * `retry()`. Unmounting (filter change) aborts the in-flight request.
 */
export function useKudosInfiniteList(options: KudosInfiniteListOptions): KudosInfiniteList {
  const { initial, filters, viewerSunnerId, withViewerFlags } = options;
  const [state, dispatch] = useReducer(listReducer, initial, initialState);
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);

  // Latest viewer data without restarting an in-flight request when it changes.
  const viewerRef = useRef({ viewerSunnerId, withViewerFlags });
  useEffect(() => {
    viewerRef.current = { viewerSunnerId, withViewerFlags };
  }, [viewerSunnerId, withViewerFlags]);

  const { status, nextCursor } = state;
  const { hashtag, department } = filters;

  // Watches the sentinel only while idle: no repeat triggers during a load,
  // and a fresh observer re-fires if the sentinel is still in view afterwards.
  useEffect(() => {
    if (status !== "idle" || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) dispatch({ type: "start" });
      },
      { rootMargin: `${SENTINEL_ROOT_MARGIN_PX}px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [status, sentinel]);

  useEffect(() => {
    if (status !== "loading" || nextCursor === null) return;
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(pageUrl(nextCursor, { hashtag, department }), {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`kudos page ${response.status}`);
        const body: unknown = await response.json();
        if (!isKudosPage(body)) throw new Error("kudos page: unexpected response shape");
        const { viewerSunnerId: viewerId, withViewerFlags: flag } = viewerRef.current;
        dispatch({
          type: "success",
          page: { ...body, items: body.items.map((card) => flag(card, viewerId)) },
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("[kudos] load more failed", error);
        dispatch({ type: "failure" });
      }
    })();
    return () => controller.abort();
  }, [status, nextCursor, hashtag, department]);

  const retry = useCallback(() => dispatch({ type: "retry" }), []);

  return { items: state.items, status, sentinelRef: setSentinel, retry };
}
