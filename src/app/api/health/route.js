/**
 * GET /api/health — Health check
 */

import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "healthy",
        service: "C Factory",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
}
