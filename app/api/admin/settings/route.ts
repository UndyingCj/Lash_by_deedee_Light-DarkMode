import { type NextRequest, NextResponse } from "next/server"
import { getBusinessSettings, updateBusinessSettings } from "@/lib/settings"

export async function GET() {
  try {
    const settings = await getBusinessSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()
    await updateBusinessSettings(settings)

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
