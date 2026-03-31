/**
 * C Factory Trace Logger (Option 0 - Local Only)
 * Manages detailed user action logs in localStorage.
 */

const TRACE_KEY = "cfactory_traces";
const HISTORY_KEY = "cfactory_history";

/**
 * Logs a specific user action with details.
 * @param {string} action - Descriptive action name (e.g., 'Decode Start', 'CV Match Success')
 * @param {Object} details - Additional data (input, result summary, errors)
 */
export function logTrace(action, details = {}) {
    if (typeof window === "undefined") return;

    try {
        const traces = JSON.parse(localStorage.getItem(TRACE_KEY) || "[]");
        const newTrace = {
            id: Date.now() + Math.random().toString(36).slice(2, 7),
            timestamp: new Date().toISOString(),
            action,
            details,
            path: window.location.pathname
        };

        // Keep last 200 traces
        traces.unshift(newTrace);
        localStorage.setItem(TRACE_KEY, JSON.stringify(traces.slice(0, 200)));

        console.debug(`[Trace] ${action}`, details);
    } catch (e) {
        console.warn("Tracing failed:", e);
    }
}

/**
 * Retrieves all local traces.
 */
export function getTraces() {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(TRACE_KEY) || "[]");
}

/**
 * Clears all local tracing and history data.
 */
export function clearAllLocalData() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TRACE_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem("cfactory_current_session");
}
