import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Professional logging utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[AVAILABILITY-API] INFO: ${message}`, data ? JSON.stringify(data, null, 2) : "")
  },
  error: (message: string, error?: any) => {
    console.error(`[AVAILABILITY-API] ERROR: ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[AVAILABILITY-API] WARN: ${message}`, data ? JSON.stringify(data, null, 2) : "")
  },
}

// Professional response utility
const createResponse = (success: boolean, data?: any, error?: string, statusCode = 200) => {
  const response = {
    success,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
    ...(error && { error, message: error }),
  }

  return NextResponse.json(response, { status: statusCode })
}

// Input validation
const validateDateFormat = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

const validateTimeFormat = (timeString: string): boolean => {
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/
  return timeRegex.test(timeString)
}

// Initialize Supabase client with proper error handling
const initializeSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing required Supabase environment variables")
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.info("Processing availability request")

    // Initialize Supabase client
    const supabase = initializeSupabase()

    // Fetch blocked dates with error handling
    logger.info("Fetching blocked dates from database")
    const { data: blockedDates, error: datesError } = await supabase
      .from("blocked_dates")
      .select("id, blocked_date, reason, created_at")
      .order("blocked_date", { ascending: true })

    if (datesError) {
      logger.error("Failed to fetch blocked dates", datesError)
      return createResponse(false, null, "Failed to fetch blocked dates from database", 500)
    }

    // Fetch blocked time slots with error handling
    logger.info("Fetching blocked time slots from database")
    const { data: blockedSlots, error: slotsError } = await supabase
      .from("blocked_time_slots")
      .select("id, blocked_date, blocked_time, reason, created_at")
      .order("blocked_date", { ascending: true })
      .order("blocked_time", { ascending: true })

    if (slotsError) {
      logger.error("Failed to fetch blocked slots", slotsError)
      return createResponse(false, null, "Failed to fetch blocked time slots from database", 500)
    }

    // Process and validate data
    const processedBlockedDates = (blockedDates || []).map((item) => ({
      id: item.id,
      blocked_date: item.blocked_date,
      reason: item.reason || "Unavailable",
      created_at: item.created_at,
    }))

    const processedBlockedSlots = (blockedSlots || []).map((item) => ({
      id: item.id,
      blocked_date: item.blocked_date,
      blocked_time: item.blocked_time,
      reason: item.reason || "Unavailable",
      created_at: item.created_at,
    }))

    const responseData = {
      blockedDates: processedBlockedDates,
      blockedSlots: processedBlockedSlots,
      statistics: {
        totalBlockedDates: processedBlockedDates.length,
        totalBlockedSlots: processedBlockedSlots.length,
        processingTime: `${Date.now() - startTime}ms`,
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "2.0.0",
      },
    }

    logger.info("Successfully processed availability request", {
      blockedDates: processedBlockedDates.length,
      blockedSlots: processedBlockedSlots.length,
      processingTime: Date.now() - startTime,
    })

    return createResponse(true, responseData)
  } catch (error) {
    logger.error("Unexpected error in availability endpoint", error)
    return createResponse(false, null, "An unexpected error occurred while fetching availability data", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.info("Processing availability update request")

    const body = await request.json()
    const { type, date, time, reason } = body

    // Input validation
    if (!type || !["block_date", "block_slot", "unblock_date", "unblock_slot"].includes(type)) {
      return createResponse(false, null, "Invalid or missing operation type", 400)
    }

    if (!date || !validateDateFormat(date)) {
      return createResponse(false, null, "Invalid or missing date format (YYYY-MM-DD required)", 400)
    }

    if ((type === "block_slot" || type === "unblock_slot") && (!time || !validateTimeFormat(time))) {
      return createResponse(false, null, "Invalid or missing time format (HH:MM AM/PM required)", 400)
    }

    // Initialize Supabase client
    const supabase = initializeSupabase()

    let result
    switch (type) {
      case "block_date":
        result = await supabase
          .from("blocked_dates")
          .insert([{ blocked_date: date, reason: reason || "Blocked by admin" }])
        break

      case "unblock_date":
        result = await supabase.from("blocked_dates").delete().eq("blocked_date", date)
        break

      case "block_slot":
        result = await supabase
          .from("blocked_time_slots")
          .insert([{ blocked_date: date, blocked_time: time, reason: reason || "Blocked by admin" }])
        break

      case "unblock_slot":
        result = await supabase.from("blocked_time_slots").delete().eq("blocked_date", date).eq("blocked_time", time)
        break
    }

    if (result?.error) {
      logger.error(`Failed to ${type}`, result.error)
      return createResponse(false, null, `Failed to ${type.replace("_", " ")}`, 500)
    }

    logger.info(`Successfully processed ${type}`, { date, time, reason })
    return createResponse(true, {
      operation: type,
      date,
      time,
      reason,
      message: `Successfully ${type.replace("_", " ")}`,
    })
  } catch (error) {
    logger.error("Unexpected error in availability update", error)
    return createResponse(false, null, "An unexpected error occurred while updating availability", 500)
  }
}
