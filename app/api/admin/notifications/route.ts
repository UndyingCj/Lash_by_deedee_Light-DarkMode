import { type NextRequest, NextResponse } from "next/server"
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  getUnreadNotificationCount,
} from "@/lib/settings"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "count") {
      const count = await getUnreadNotificationCount()
      return NextResponse.json({ count })
    }

    const notifications = await getNotifications()
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, expiresInHours } = await request.json()
    const notification = await createNotification(title, message, type, expiresInHours)

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json()
    await markNotificationAsRead(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
