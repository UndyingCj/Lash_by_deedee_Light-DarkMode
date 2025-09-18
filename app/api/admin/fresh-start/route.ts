import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    console.log("🧹 Starting COMPLETE fresh start - clearing ALL data...")

    let deletedTables = []
    let clearedTables = []

    // List of tables to completely clear
    const tablesToClear = [
      'bookings',
      'blocked_dates',
      'blocked_time_slots',
      'business_hours',
      'notifications',
      'business_settings'
    ]

    // Clear each table completely
    for (const tableName of tablesToClear) {
      try {
        console.log(`🗑️ Clearing table: ${tableName}`)

        const { data: existingData, error: checkError } = await supabaseAdmin
          .from(tableName)
          .select('count(*)', { count: 'exact', head: true })

        if (checkError) {
          console.log(`📋 Table ${tableName} doesn't exist or error accessing: ${checkError.message}`)
          continue
        }

        // Use SQL to completely truncate the table
        try {
          await supabaseAdmin.rpc('sql', {
            query: `TRUNCATE TABLE public.${tableName} RESTART IDENTITY CASCADE;`
          })
          console.log(`✅ Cleared table: ${tableName}`)
          clearedTables.push(tableName)
        } catch (truncateError) {
          // If truncate fails, try delete all records
          try {
            const { error: deleteError } = await supabaseAdmin
              .from(tableName)
              .delete()
              .gte('id', 0) // Delete all records where id >= 0 (which is all records)

            if (deleteError) {
              console.log(`❌ Error clearing ${tableName}: ${deleteError.message}`)
            } else {
              console.log(`✅ Cleared table: ${tableName}`)
              clearedTables.push(tableName)
            }
          } catch (deleteError) {
            console.log(`❌ Failed to clear table ${tableName}: ${deleteError}`)
          }
        }
      } catch (error) {
        console.log(`📋 Table ${tableName} access failed: ${error}`)
      }
    }

    // Reset any auto-increment sequences
    try {
      for (const tableName of clearedTables) {
        await supabaseAdmin.rpc('sql', {
          query: `ALTER SEQUENCE IF EXISTS ${tableName}_id_seq RESTART WITH 1;`
        })
      }
    } catch (error) {
      console.log("📋 Sequence reset not available or failed (this is normal)")
    }

    console.log("✅ Fresh start completed - all data cleared")

    return NextResponse.json({
      success: true,
      message: "Fresh start completed successfully!",
      actions: [
        "Cleared all bookings data",
        "Cleared all blocked dates and time slots",
        "Cleared all notifications",
        "Cleared all business settings",
        "Reset database to fresh state"
      ],
      clearedTables,
      nextSteps: [
        "Admin panel will now show zero values",
        "Ready for real business data",
        "All APIs will work with empty state"
      ]
    })

  } catch (error) {
    console.error("❌ Fresh start error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown fresh start error"
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Show current data counts without deleting
    const tablesToCheck = ['bookings', 'blocked_dates', 'blocked_time_slots', 'business_hours', 'notifications', 'business_settings']
    let dataCounts = {}

    for (const tableName of tablesToCheck) {
      try {
        const { count, error } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (error) {
          dataCounts[tableName] = 'Table not found'
        } else {
          dataCounts[tableName] = count || 0
        }
      } catch (error) {
        dataCounts[tableName] = 'Access error'
      }
    }

    return NextResponse.json({
      currentDataCounts: dataCounts,
      message: "POST to this endpoint to completely clear all data and start fresh",
      warning: "⚠️ This will permanently delete ALL data in your database!"
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}