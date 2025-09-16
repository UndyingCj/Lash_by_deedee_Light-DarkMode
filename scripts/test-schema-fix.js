// Test script to verify the schema fix works correctly
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSchemaFix() {
  console.log('🧪 Testing schema fix...')
  
  try {
    // Test 1: Check if blocked_time_slots table exists and has correct structure
    console.log('\n📋 Test 1: Checking blocked_time_slots table structure...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'blocked_time_slots')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError)
      return false
    }
    
    console.log('✅ blocked_time_slots columns:', columns)
    
    // Verify required columns exist
    const requiredColumns = ['id', 'blocked_date', 'blocked_time', 'reason', 'created_at']
    const existingColumns = columns.map(col => col.column_name)
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
    
    if (missingColumns.length > 0) {
      console.error('❌ Missing required columns:', missingColumns)
      return false
    }
    
    // Verify booking_id column is NOT present
    if (existingColumns.includes('booking_id')) {
      console.error('❌ booking_id column still exists - schema fix failed')
      return false
    }
    
    console.log('✅ Table structure is correct')
    
    // Test 2: Test inserting data into blocked_time_slots
    console.log('\n📋 Test 2: Testing blocked_time_slots insert...')
    
    const testDate = '2024-12-25'
    const testTime = '10:00 AM'
    const testReason = 'Schema test slot'
    
    const { data: insertData, error: insertError } = await supabase
      .from('blocked_time_slots')
      .insert({
        blocked_date: testDate,
        blocked_time: testTime,
        reason: testReason
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Error inserting test data:', insertError)
      return false
    }
    
    console.log('✅ Insert successful:', insertData)
    
    // Test 3: Test querying the data
    console.log('\n📋 Test 3: Testing blocked_time_slots query...')
    
    const { data: queryData, error: queryError } = await supabase
      .from('blocked_time_slots')
      .select('*')
      .eq('blocked_date', testDate)
      .eq('blocked_time', testTime)
    
    if (queryError) {
      console.error('❌ Error querying test data:', queryError)
      return false
    }
    
    console.log('✅ Query successful:', queryData)
    
    // Test 4: Test unique constraint
    console.log('\n📋 Test 4: Testing unique constraint...')
    
    const { error: duplicateError } = await supabase
      .from('blocked_time_slots')
      .insert({
        blocked_date: testDate,
        blocked_time: testTime,
        reason: 'Duplicate test'
      })
    
    if (!duplicateError) {
      console.error('❌ Unique constraint not working - duplicate insert succeeded')
      return false
    }
    
    console.log('✅ Unique constraint working correctly:', duplicateError.message)
    
    // Test 5: Test blocked_dates table
    console.log('\n📋 Test 5: Testing blocked_dates table...')
    
    const { data: blockedDateData, error: blockedDateError } = await supabase
      .from('blocked_dates')
      .insert({
        blocked_date: testDate,
        reason: 'Schema test date'
      })
      .select()
      .single()
    
    if (blockedDateError) {
      console.error('❌ Error with blocked_dates table:', blockedDateError)
      return false
    }
    
    console.log('✅ blocked_dates table working correctly:', blockedDateData)
    
    // Test 6: Test availability API simulation
    console.log('\n📋 Test 6: Testing availability logic simulation...')
    
    // Simulate what the availability API does
    const checkDate = testDate
    
    // Check blocked dates
    const { data: blockedDates } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('blocked_date', checkDate)
    
    // Check blocked time slots
    const { data: blockedTimeSlots } = await supabase
      .from('blocked_time_slots')
      .select('*')
      .eq('blocked_date', checkDate)
    
    // Check bookings (simulate)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('booking_time, status')
      .eq('booking_date', checkDate)
      .neq('status', 'cancelled')
    
    console.log('✅ Availability check simulation results:', {
      blockedDates: blockedDates?.length || 0,
      blockedTimeSlots: blockedTimeSlots?.length || 0,
      existingBookings: bookings?.length || 0
    })
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    
    await supabase
      .from('blocked_time_slots')
      .delete()
      .eq('reason', testReason)
    
    await supabase
      .from('blocked_dates')
      .delete()
      .eq('reason', 'Schema test date')
    
    console.log('✅ Test data cleaned up')
    
    // Test 7: Test payment verification flow simulation
    console.log('\n📋 Test 7: Testing payment verification flow simulation...')
    
    // Create a test booking
    const testBooking = {
      client_name: 'Test Customer',
      client_email: 'test@example.com',
      client_phone: '+234 800 000 0000',
      phone: '+234 800 000 0000',
      email: 'test@example.com',
      service_name: 'Test Service',
      service: 'Test Service',
      booking_date: '2024-12-26',
      booking_time: '2:00 PM',
      total_amount: 50000,
      amount: 25000,
      deposit_amount: 25000,
      payment_status: 'pending',
      payment_reference: 'test_ref_' + Date.now(),
      status: 'pending',
      notes: 'Schema test booking'
    }
    
    const { data: createdBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select()
      .single()
    
    if (bookingError) {
      console.error('❌ Error creating test booking:', bookingError)
      return false
    }
    
    console.log('✅ Test booking created:', createdBooking.id)
    
    // Simulate payment verification update
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'completed',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', createdBooking.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Error updating test booking:', updateError)
      return false
    }
    
    console.log('✅ Test booking updated successfully')
    
    // Simulate time slot blocking
    const { data: blockedSlot, error: blockError } = await supabase
      .from('blocked_time_slots')
      .insert({
        blocked_date: testBooking.booking_date,
        blocked_time: testBooking.booking_time,
        reason: `Booked by ${testBooking.client_name} (test)`,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (blockError) {
      console.error('❌ Error blocking time slot:', blockError)
      return false
    }
    
    console.log('✅ Time slot blocked successfully:', blockedSlot)
    
    // Clean up test booking and blocked slot
    await supabase.from('blocked_time_slots').delete().eq('id', blockedSlot.id)
    await supabase.from('bookings').delete().eq('id', createdBooking.id)
    
    console.log('✅ Test booking and blocked slot cleaned up')
    
    console.log('\n🎉 All schema tests passed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Schema test failed:', error)
    return false
  }
}

// Run the test
testSchemaFix()
  .then(success => {
    if (success) {
      console.log('\n✅ Schema fix verification completed successfully!')
      process.exit(0)
    } else {
      console.log('\n❌ Schema fix verification failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error)
    process.exit(1)
  })
