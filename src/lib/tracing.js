/**
 * C Factory Trace Logger (Centralized Sync)
 * Manages user action logs in local storage AND syncs to SheetDB for cross-device visibility.
 */

import { recordActivity } from "./db";

const TRACE_KEY = "cfactory_traces";

/**
 * Logs a specific user action with details and syncs to cloud.
 * @param {string} action - Descriptive action name (e.g., 'JD Decode Success')
 * @param {Object} details - Additional data (input, result summary, errors)
 * @param {boolean} syncToCloud - Whether to sync to SheetDB (default: true)
 */
export async function logTrace(action, details = {}, syncToCloud = true) {
    if (typeof window === "undefined") return;

    try {
        const id = Date.now() + Math.random().toString(36).slice(2, 7);
        const timestamp = new Date().toISOString();
        const path = window.location.pathname;

        const newTrace = { id, timestamp, action, details, path };

        // 1. Local Logging (Fallback/Redundant)
        const traces = JSON.parse(localStorage.getItem(TRACE_KEY) || "[]");
        traces.unshift(newTrace);
        localStorage.setItem(TRACE_KEY, JSON.stringify(traces.slice(0, 100)));

        console.debug(`[Trace] ${action}`, details);

        // 2. Cloud Sync (Centralized Visibility)
        if (syncToCloud) {
            // Simplified summary for the trace feed
            const summary = details.result?.raw_jd_summary || details.error || action;
            const score = details.score || details.result?.difficulty_score || "";
            const context = details.role || details.best_match || "System Action";

            await recordActivity({
                type: action,
                context,
                summary,
                score,
                payload: details, // Full details as payload
                input: { path, timestamp }
            });
        }
    } catch (e) {
        console.warn("Tracing/Sync failed:", e);
    }
}

/**
 * Retrieves all local traces (for local dev/diagnostics).
 */
export function getLocalTraces() {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(TRACE_KEY) || "[]");
}

/**
 * Clears local tracing data.
 */
export function clearLocalTraces() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TRACE_KEY);
    localStorage.removeItem("cfactory_current_session");
}
