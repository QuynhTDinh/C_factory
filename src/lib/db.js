/**
 * C Factory Master Database Utility
 * Handles persistent logging to SheetDB for all core features (Decode, Compare, Assess).
 * Unified with existing SCLS headers for compatibility.
 */

const SHEETDB_URL = "https://sheetdb.io/api/v1/bbjxmtir1riyg";

/**
 * Records an activity to the master database.
 * Maps C Factory fields to existing SCLS Vietnamese headers for compatibility.
 */
export async function recordActivity({ type, context, summary, score, payload, input }) {
    try {
        const row = {
            "Mã ứng viên": type,                      // Type: Decode, Compare, Assess
            "Họ và tên": context,                    // Context: Role, Candidate Name
            "Email": new Date().toLocaleString("vi-VN"), // Timestamp stored in Email column
            "Chuyên ngành": summary,                  // Summary text
            "Cấp độ năng lực": score || "",           // Score %
            "Lộ trình nghề nghiệp mong muốn": JSON.stringify(payload), // Full JSON
            "Ghi chú": JSON.stringify(input)         // Raw Input
        };

        const response = await fetch(SHEETDB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: [row] }),
        });

        if (!response.ok) console.warn("Failed to log activity to Master DB");
        return await response.json();
    } catch (error) {
        console.error("Database Error:", error);
        return null;
    }
}

/**
 * Fetches activities and maps them back to developer-friendly keys.
 */
export async function fetchActivities(limit = 100) {
    try {
        const response = await fetch(`${SHEETDB_URL}?limit=${limit}`);
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();

        // Map back to internal keys
        return data.map(r => ({
            Type: r["Mã ứng viên"] || "Assess",
            Context: r["Họ và tên"] || "N/A",
            Timestamp: r["Email"] || "N/A",
            Summary: r["Chuyên ngành"] || "",
            Score: r["Cấp độ năng lực"] ? r["Cấp độ năng lực"].replace('%', '') : "",
            FullReport: r["Lộ trình nghề nghiệp mong muốn"] || "{}",
            RawData: r["Ghi chú"] || "{}"
        })).reverse();

    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
}
