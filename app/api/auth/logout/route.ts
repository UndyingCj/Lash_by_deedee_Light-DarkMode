import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear the auth cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    console.log("✅ Admin logged out")
    return response

  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    )
  }
}