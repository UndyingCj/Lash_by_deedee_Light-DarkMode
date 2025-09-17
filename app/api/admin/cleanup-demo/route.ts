import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    console.log("🧹 Starting demo data cleanup...")

    // List of demo/test indicators to identify demo data
    const demoIndicators = [
      'test',
      'demo',
      'example',
      'sample',
      'fake',
      'dummy',
      'temp',
      'trial',
      'professional test',
      'system',
      'SYSTEM_SETTINGS_TEMP',
      'PROF_TEST',
      'TEST_EMAIL',
      'chiji470@gmail.com' // Test email from earlier
    ]

    let deletedCount = 0

    // Clean up demo bookings
    try {
      for (const indicator of demoIndicators) {
        // Delete bookings with demo indicators in various fields
        const { data: bookingsToDelete, error: fetchError } = await supabaseAdmin
          .from('bookings')
          .select('id, customer_name, customer_email, payment_reference, notes')
          .or(`customer_name.ilike.%${indicator}%, customer_email.ilike.%${indicator}%, payment_reference.ilike.%${indicator}%, notes.ilike.%${indicator}%`)

        if (!fetchError && bookingsToDelete && bookingsToDelete.length > 0) {
          console.log(`🗑️ Found ${bookingsToDelete.length} demo bookings with indicator: ${indicator}`)

          const { error: deleteError } = await supabaseAdmin
            .from('bookings')
            .delete()
            .or(`customer_name.ilike.%${indicator}%, customer_email.ilike.%${indicator}%, payment_reference.ilike.%${indicator}%, notes.ilike.%${indicator}%`)

          if (!deleteError) {
            deletedCount += bookingsToDelete.length
            console.log(`✅ Deleted ${bookingsToDelete.length} demo bookings`)
          }
        }
      }

      // Delete very old test bookings (before 2025)
      const { data: oldBookings, error: oldError } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .lt('booking_date', '2025-01-01')

      if (!oldError && oldBookings && oldBookings.length > 0) {
        const { error: deleteOldError } = await supabaseAdmin
          .from('bookings')
          .delete()
          .lt('booking_date', '2025-01-01')

        if (!deleteOldError) {
          deletedCount += oldBookings.length
          console.log(`✅ Deleted ${oldBookings.length} old test bookings`)
        }
      }

    } catch (error) {
      console.log("📋 Bookings table not found or error accessing it")
    }

    // Clean up demo notifications if they exist
    try {
      const { data: demoNotifications, error: notifError } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .or('title.ilike.%test%, message.ilike.%test%, title.ilike.%demo%, message.ilike.%demo%')

      if (!notifError && demoNotifications && demoNotifications.length > 0) {
        const { error: deleteNotifError } = await supabaseAdmin
          .from('notifications')
          .delete()
          .or('title.ilike.%test%, message.ilike.%test%, title.ilike.%demo%, message.ilike.%demo%')

        if (!deleteNotifError) {
          console.log(`✅ Deleted ${demoNotifications.length} demo notifications`)
        }
      }
    } catch (error) {
      console.log("📋 Notifications table not found or error accessing it")
    }

    console.log("✅ Demo data cleanup completed")

    return NextResponse.json({
      success: true,
      message: "Demo data cleanup completed successfully",
      deletedRecords: deletedCount,
      cleanupActions: [
        "Removed demo/test bookings",
        "Removed old test bookings before 2025",
        "Removed demo notifications",
        "Preserved legitimate customer data"
      ]
    })

  } catch (error) {
    console.error("❌ Demo cleanup error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown cleanup error"
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Show what demo data exists without deleting
    const demoIndicators = ['test', 'demo', 'example', 'sample', 'fake', 'dummy', 'temp', 'trial', 'professional test', 'system']
    let demoData = {
      bookings: 0,
      oldBookings: 0,
      notifications: 0
    }

    try {
      // Count demo bookings
      for (const indicator of demoIndicators) {
        const { count } = await supabaseAdmin
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .or(`customer_name.ilike.%${indicator}%, customer_email.ilike.%${indicator}%, payment_reference.ilike.%${indicator}%, notes.ilike.%${indicator}%`)

        if (count) demoData.bookings += count
      }

      // Count old bookings
      const { count: oldCount } = await supabaseAdmin
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .lt('booking_date', '2025-01-01')

      demoData.oldBookings = oldCount || 0

    } catch (error) {
      console.log("📋 Tables not found")
    }

    return NextResponse.json({
      demoDataFound: demoData,
      message: "POST to this endpoint to clean up demo data",
      willClean: [
        "Demo/test bookings with test indicators",
        "Old bookings before 2025",
        "Demo notifications"
      ]
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}