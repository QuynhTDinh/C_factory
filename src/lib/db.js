/**
 * C Factory Master Database Utility
 * Handles persistent logging to SheetDB for all core features (Decode, Compare, Assess).
 */

const SHEETDB_URL = "https://sheetdb.io/api/v1/bbjxmtir1riyg";

/**
 * Records an activity to the master database.
 * @param {Object} data - The activity data to record.
 * @param {'Decode' | 'Compare' | 'Assess'} data.type - The type of activity.
 * @param {string} data.context - Brief context (e.g., Role Name, User Name).
 * @param {string} data.summary - Short summary of the result.
 * @param {number|string} data.score - Match score or similar metric (if applicable).
 * @param {Object} data.payload - Full JSON object of the result.
 * @param {Object} data.input - Raw input data.
 */
export async function recordActivity({ type, context, summary, score, payload, input }) {
    try {
        const row = {
            "Timestamp": new Date().toLocaleString("vi-VN"),
            "Type": type,
            "Context": context,
            "Summary": summary,
            "Score": score || "",
            "Full Report JSON": JSON.stringify(payload),
            "Raw Form Data": JSON.stringify(input)
        };

        const response = await fetch(SHEETDB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: [row] }),
        });

        if (!response.ok) {
            console.warn("Failed to log activity to Master DB");
        }

        return await response.json();
    } catch (error) {
        console.error("Database Error:", error);
        return null;
    }
}

/**
 * Fetches the last N activities from the master database.
 */
export async function fetchActivities(limit = 100) {
    try {
        const response = await fetch(`${SHEETDB_URL}?limit=${limit}`);
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        return data.reverse(); // Newest first
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
}
