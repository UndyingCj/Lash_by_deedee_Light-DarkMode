const { createClient } = require("@supabase/supabase-js")

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅ Set" : "❌ Missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

async function testSchemaFix() {
  log("\n" + "=".repeat(60), colors.bright)
  log("🧪 LASHED BY DEEDEE - SCHEMA FIX TEST", colors.bright)
  log("=".repeat(60), colors.bright)
  log(`Started at: ${new Date().toISOString()}`, colors.cyan)
  log("")

  try {
    // Test 1: Check table structure
    logInfo("1. CHECKING TABLE STRUCTURE...")
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "bookings")
      .eq("table_schema", "public")
      .order("ordinal_position")

    if (columnsError) {
      logError(`Error checking columns: ${columnsError.message}`)
      return
    }

    logSuccess("Bookings table columns:")
    columns.forEach((col) => {
      const nullable = col.is_nullable === "YES" ? "(nullable)" : "(required)"
      log(`   📝 ${col.column_name}: ${col.data_type} ${nullable}`)
    })
    log("")

    // Test 2: Try a complete booking insert
    logInfo("2. TESTING COMPLETE BOOKING INSERT...")
    const testBooking = {
      client_name: "Test Customer",
      client_email: "test@example.com",
      client_phone: "+234000000000",
      phone: "+234000000000",
      email: "test@example.com",
      service_name: "Test Service",
      service: "Test Service",
      booking_date: "2025-08-01",
      booking_time: "10:00 AM",
      total_amount: 30000,
      amount: 15000,
      deposit_amount: 15000,
      payment_reference: `TEST_${Date.now()}`,
      status: "pending",
      payment_status: "pending",
      notes: "Test booking",
      special_notes: "Test booking",
    }

    const { data: insertResult, error: insertError } = await supabase
      .from("bookings")
      .insert(testBooking)
      .select()
      .single()

    if (insertError) {
      logError(`INSERT FAILED: ${insertError.message}`)
      logError(`   Code: ${insertError.code}`)
      logError(`   Details: ${insertError.details}`)
      logError(`   Hint: ${insertError.hint}`)
      return
    }

    logSuccess(`INSERT SUCCESSFUL: ${insertResult.id}`)
    logInfo(`   Reference: ${insertResult.payment_reference}`)
    log("")

    // Test 3: Test update
    logInfo("3. TESTING UPDATE...")
    const { data: updateResult, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
      })
      .eq("id", insertResult.id)
      .select()
      .single()

    if (updateError) {
      logError(`UPDATE FAILED: ${updateError.message}`)
    } else {
      logSuccess("UPDATE SUCCESSFUL")
      logInfo(`   Status: ${updateResult.status}`)
      logInfo(`   Payment Status: ${updateResult.payment_status}`)
    }
    log("")

    // Test 4: Test availability data
    logInfo("4. TESTING AVAILABILITY DATA...")
    const { data: blockedDates, error: datesError } = await supabase.from("blocked_dates").select("*")

    if (datesError) {
      logError(`BLOCKED DATES ERROR: ${datesError.message}`)
    } else {
      logSuccess(`BLOCKED DATES: ${blockedDates.length} records`)
      blockedDates.forEach((date) => {
        log(`   📅 ${date.blocked_date}: ${date.reason || "No reason"}`)
      })
    }

    const { data: blockedSlots, error: slotsError } = await supabase.from("blocked_time_slots").select("*")

    if (slotsError) {
      logError(`BLOCKED SLOTS ERROR: ${slotsError.message}`)
    } else {
      logSuccess(`BLOCKED TIME SLOTS: ${blockedSlots.length} records`)
      blockedSlots.forEach((slot) => {
        log(`   ⏰ ${slot.blocked_date} ${slot.blocked_time}: ${slot.reason || "No reason"}`)
      })
    }
    log("")

    // Test 5: Test the exact API payload format
    logInfo("5. TESTING API PAYLOAD FORMAT...")
    const apiPayload = {
      client_name: "API Test Customer",
      client_email: "api@example.com",
      client_phone: "+234123456789",
      phone: "+234123456789",
      email: "api@example.com",
      service_name: "Mega Volume Lashes",
      service: "Mega Volume Lashes",
      booking_date: "2025-08-02",
      booking_time: "2:00 PM",
      total_amount: 30000,
      amount: 15000,
      deposit_amount: 15000,
      payment_reference: `API_TEST_${Date.now()}`,
      status: "pending",
      payment_status: "pending",
      notes: "API test booking",
      special_notes: "API test booking",
    }

    const { data: apiResult, error: apiError } = await supabase.from("bookings").insert(apiPayload).select().single()

    if (apiError) {
      logError(`API PAYLOAD TEST FAILED: ${apiError.message}`)
      logError(`   Code: ${apiError.code}`)
    } else {
      logSuccess(`API PAYLOAD TEST SUCCESSFUL: ${apiResult.id}`)

      // Clean up API test data
      await supabase.from("bookings").delete().eq("id", apiResult.id)
      logInfo("API test data cleaned up")
    }

    // Clean up original test data
    logInfo("🧹 CLEANING UP TEST DATA...")
    await supabase.from("bookings").delete().eq("id", insertResult.id)
    logSuccess("Test data cleaned up")
    log("")

    logSuccess("🎉 ALL TESTS PASSED! Schema is working correctly.")
  } catch (error) {
    logError(`TEST FAILED: ${error.message}`)
    console.error(error)
  }

  log("")
  log("=".repeat(60), colors.bright)
  log("📊 SCHEMA FIX TEST COMPLETE", colors.bright)
  log("=".repeat(60), colors.bright)
  log(`Completed at: ${new Date().toISOString()}`, colors.cyan)
}

// Run the test
testSchemaFix()
