import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "Settings fix deployed",
    timestamp: new Date().toISOString(),
    version: "v2.1-settings-fix",
    message: "Settings page should now work with default values"
  })
}