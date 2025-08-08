import { NextRequest } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-minimum-32-chars-long'

export interface AuthUser {
  username: string
  role: string
}

export async function verifyAuth(req: NextRequest): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const token = req.cookies.get('admin-token')?.value

    if (!token) {
      return { success: false, error: "No authentication token provided" }
    }

    const decoded = verify(token, JWT_SECRET) as any

    return {
      success: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    }
  } catch (error) {
    console.error("❌ Auth verification failed:", error)
    return { success: false, error: "Invalid authentication token" }
  }
}

export function requireAuth(handler: (req: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (req: NextRequest) => {
    const authResult = await verifyAuth(req)
    
    if (!authResult.success || !authResult.user) {
      return new Response(
        JSON.stringify({ success: false, message: authResult.error || "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    return handler(req, authResult.user)
  }
}