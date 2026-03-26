/**
 * C Factory — API Client
 *
 * Uses Next.js API routes (same-origin) for both local dev and Vercel production.
 */

/**
 * Phân tích JD
 */
export async function decodeJD({ content, role, company, industry }) {
    const response = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, role, company, industry }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Phân tích thất bại: ${error}`);
    }

    return response.json();
}

/**
 * So sánh nhiều JD với CV
 */
export async function compareJDs({ cv_content, jds }) {
    const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_content, jds }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`So sánh thất bại: ${error}`);
    }

    return response.json();
}

/**
 * Nộp Survey SCLS Connect 2026
 */
export async function submitSurvey(surveyData) {
    const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gửi survey thất bại: ${error}`);
    }

    return response.json();
}

/**
 * Health check
 */
export async function healthCheck() {
    const response = await fetch("/api/health");
    return response.json();
}
