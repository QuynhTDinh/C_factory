/**
 * C Factory — API Client
 *
 * Uses Next.js API routes (same-origin) for both local dev and Vercel production.
 */

/** Phân tích JD */
export async function decodeJD({ content, role, company, industry, profile }) {
    const response = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, role, company, industry, profile }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

/** So sánh nhiều JD với CV */
export async function compareJDs({ cv_content, jds, profile }) {
    const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_content, jds, profile }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

/** Nộp Survey SCLS Connect 2026 */
export async function analyzeSurvey(surveyData) {
    const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

/** Health check */
export async function healthCheck() {
    const response = await fetch("/api/health");
    return response.json();
}
