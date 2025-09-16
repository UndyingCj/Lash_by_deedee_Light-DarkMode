import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    console.log("🔧 Initializing settings tables...")

    // Create business_settings table
    const { error: settingsTableError } = await supabaseAdmin.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS business_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(255) UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          setting_type VARCHAR(50) DEFAULT 'string',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (settingsTableError) {
      console.error("Error creating business_settings table:", settingsTableError)
    }

    // Create notifications table
    const { error: notificationsTableError } = await supabaseAdmin.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE
        );
      `
    })

    if (notificationsTableError) {
      console.error("Error creating notifications table:", notificationsTableError)
    }

    // Create indexes
    await supabaseAdmin.rpc('sql', {
      query: `
        CREATE INDEX IF NOT EXISTS idx_business_settings_key ON business_settings(setting_key);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      `
    })

    // Enable RLS
    await supabaseAdmin.rpc('sql', {
      query: `
        ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
      `
    })

    // Create policies
    await supabaseAdmin.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Allow all operations for service role" ON business_settings;
        DROP POLICY IF EXISTS "Allow all operations for service role on notifications" ON notifications;

        CREATE POLICY "Allow all operations for service role" ON business_settings FOR ALL USING (true);
        CREATE POLICY "Allow all operations for service role on notifications" ON notifications FOR ALL USING (true);
      `
    })

    // Insert default settings
    const defaultSettings = [
      { setting_key: 'business_name', setting_value: 'Lashed by Deedee', setting_type: 'string' },
      { setting_key: 'business_email', setting_value: 'bookings@lashedbydeedee.com', setting_type: 'string' },
      { setting_key: 'business_phone', setting_value: '+234 816 543 5528', setting_type: 'string' },
      { setting_key: 'business_address', setting_value: 'Port Harcourt, Nigeria', setting_type: 'string' },
      { setting_key: 'business_description', setting_value: 'Where Beauty Meets Precision. Professional lash and brow services.', setting_type: 'string' },
      { setting_key: 'booking_buffer', setting_value: '15', setting_type: 'number' },
      { setting_key: 'max_advance_booking', setting_value: '30', setting_type: 'number' },
      { setting_key: 'cancellation_policy', setting_value: '24', setting_type: 'number' },
      { setting_key: 'auto_confirm_bookings', setting_value: 'false', setting_type: 'boolean' },
      { setting_key: 'email_notifications', setting_value: 'true', setting_type: 'boolean' },
      { setting_key: 'sms_notifications', setting_value: 'false', setting_type: 'boolean' },
      { setting_key: 'booking_reminders', setting_value: 'true', setting_type: 'boolean' },
      { setting_key: 'marketing_emails', setting_value: 'false', setting_type: 'boolean' },
      { setting_key: 'two_factor_auth', setting_value: 'false', setting_type: 'boolean' },
      { setting_key: 'session_timeout', setting_value: '60', setting_type: 'number' },
      { setting_key: 'password_expiry', setting_value: '90', setting_type: 'number' },
      { setting_key: 'theme', setting_value: 'light', setting_type: 'string' },
      { setting_key: 'primary_color', setting_value: 'pink', setting_type: 'string' },
      { setting_key: 'timezone', setting_value: 'Africa/Lagos', setting_type: 'string' }
    ]

    for (const setting of defaultSettings) {
      const { error } = await supabaseAdmin
        .from('business_settings')
        .upsert(setting, { onConflict: 'setting_key' })

      if (error) {
        console.error(`Error inserting setting ${setting.setting_key}:`, error)
      }
    }

    // Test the tables
    const { data: settingsTest, error: settingsTestError } = await supabaseAdmin
      .from('business_settings')
      .select('count(*)', { count: 'exact', head: true })

    const { data: notificationsTest, error: notificationsTestError } = await supabaseAdmin
      .from('notifications')
      .select('count(*)', { count: 'exact', head: true })

    console.log("✅ Settings tables initialized successfully")
    console.log("✅ Settings count:", settingsTest)
    console.log("✅ Notifications table ready:", !notificationsTestError)

    return NextResponse.json({
      success: true,
      message: "Settings tables initialized successfully",
      tables: {
        business_settings: !settingsTableError && !settingsTestError,
        notifications: !notificationsTableError && !notificationsTestError
      },
      settingsCount: settingsTest || 0
    })

  } catch (error) {
    console.error("❌ Error initializing settings tables:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Settings Tables Initialization",
    description: "POST to initialize business_settings and notifications tables",
    endpoints: {
      "POST /api/admin/init-settings": "Initialize missing database tables"
    }
  })
}