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

async function diagnoseSchema() {
  log("\n" + "=".repeat(60), colors.bright)
  log("🔍 LASHED BY DEEDEE - DATABASE SCHEMA DIAGNOSIS", colors.bright)
  log("=".repeat(60), colors.bright)
  log(`Started at: ${new Date().toISOString()}`, colors.cyan)
  log("")

  try {
    // Test 1: Check if we can connect to the database
    logInfo("1. Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1)

    if (connectionError) {
      logError(`Database connection failed: ${connectionError.message}`)
      return
    }
    logSuccess("Database connection successful")
    log("")

    // Test 2: List all tables
    logInfo("2. Listing all tables in public schema...")
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name")

    if (tablesError) {
      logError(`Failed to list tables: ${tablesError.message}`)
      return
    }

    logSuccess(`Found ${tables.length} tables:`)
    tables.forEach((table) => {
      log(`   📋 ${table.table_name}`)
    })
    log("")

    // Test 3: Check bookings table structure
    logInfo("3. Analyzing bookings table structure...")
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_name", "bookings")
      .eq("table_schema", "public")
      .order("ordinal_position")

    if (columnsError) {
      logError(`Failed to get bookings columns: ${columnsError.message}`)
      return
    }

    if (columns.length === 0) {
      logWarning("Bookings table not found or has no columns")
      return
    }

    logSuccess(`Bookings table has ${columns.length} columns:`)
    columns.forEach((col) => {
      const nullable = col.is_nullable === "YES" ? "(nullable)" : "(required)"
      const defaultVal = col.column_default ? ` [default: ${col.column_default}]` : ""
      log(`   📝 ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`)
    })
    log("")

    // Test 4: Check for required columns that our API expects
    logInfo("4. Checking for required API columns...")
    const requiredColumns = [
      "client_name",
      "client_email",
      "client_phone",
      "phone",
      "email",
      "service_name",
      "service",
      "booking_date",
      "booking_time",
      "total_amount",
      "amount",
      "deposit_amount",
      "payment_reference",
      "payment_status",
      "status",
      "notes",
      "special_notes",
    ]

    const existingColumns = columns.map((col) => col.column_name)
    const missingColumns = requiredColumns.filter((col) => !existingColumns.includes(col))
    const extraColumns = existingColumns.filter(
      (col) => !requiredColumns.includes(col) && col !== "id" && col !== "created_at" && col !== "updated_at",
    )

    if (missingColumns.length === 0) {
      logSuccess("All required columns are present")
    } else {
      logError(`Missing required columns: ${missingColumns.join(", ")}`)
    }

    if (extraColumns.length > 0) {
      logInfo(`Extra columns found: ${extraColumns.join(", ")}`)
    }
    log("")

    // Test 5: Try a test insert to see what happens
    logInfo("5. Testing a sample insert operation...")
    const testData = {
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
      payment_reference: `DIAG_${Date.now()}`,
      status: "pending",
      payment_status: "pending",
      notes: "Diagnostic test",
      special_notes: "Diagnostic test",
    }

    const { data: insertResult, error: insertError } = await supabase
      .from("bookings")
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      logError(`Test insert failed: ${insertError.message}`)
      logError(`Error code: ${insertError.code}`)
      logError(`Error details: ${insertError.details}`)
      logError(`Error hint: ${insertError.hint}`)
    } else {
      logSuccess(`Test insert successful! Booking ID: ${insertResult.id}`)

      // Clean up the test data
      await supabase.from("bookings").delete().eq("id", insertResult.id)
      logInfo("Test data cleaned up")
    }
    log("")

    // Test 6: Check blocked dates and time slots tables
    logInfo("6. Checking availability tables...")

    const { data: blockedDates, error: datesError } = await supabase.from("blocked_dates").select("*").limit(5)

    if (datesError) {
      logError(`Blocked dates table error: ${datesError.message}`)
    } else {
      logSuccess(`Blocked dates table working. Found ${blockedDates.length} sample records`)
    }

    const { data: blockedSlots, error: slotsError } = await supabase.from("blocked_time_slots").select("*").limit(5)

    if (slotsError) {
      logError(`Blocked time slots table error: ${slotsError.message}`)
    } else {
      logSuccess(`Blocked time slots table working. Found ${blockedSlots.length} sample records`)
    }
  } catch (error) {
    logError(`Diagnosis failed: ${error.message}`)
    console.error(error)
  }

  log("")
  log("=".repeat(60), colors.bright)
  log("📊 DIAGNOSIS COMPLETE", colors.bright)
  log("=".repeat(60), colors.bright)
  log(`Completed at: ${new Date().toISOString()}`, colors.cyan)
}

// Run the diagnosis
diagnoseSchema()
