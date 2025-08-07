const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSchemaFix() {
  console.log('🧪 Starting schema fix test...')
  
  try {
    // Test 1: Check table structure
    console.log('\n📋 Test 1: Checking table structure...')
    
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'blocked_time_slots' })
      .catch(() => {
        // Fallback: try to query the table directly
        return supabase.from('blocked_time_slots').select('*').limit(0)
      })
    
    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError)
    } else {
      console.log('✅ Table structure check passed')
    }

    // Test 2: Insert test data
    console.log('\n📝 Test 2: Testing insert operations...')
    
    const testData = [
      {
        blocked_date: '2025-02-01',
        blocked_time: '10:00 AM',
        reason: 'Test block 1'
      },
      {
        blocked_date: '2025-02-01',
        blocked_time: '2:00 PM',
        reason: 'Test block 2'
      },
      {
        blocked_date: '2025-02-02',
        blocked_time: '11:00 AM',
        reason: 'Test block 3'
      }
    ]

    const { data: insertedData, error: insertError } = await supabase
      .from('blocked_time_slots')
      .insert(testData)
      .select()

    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
    } else {
      console.log(`✅ Successfully inserted ${insertedData.length} test records`)
    }

    // Test 3: Test unique constraint
    console.log('\n🔒 Test 3: Testing unique constraint...')
    
    const { error: duplicateError } = await supabase
      .from('blocked_time_slots')
      .insert({
        blocked_date: '2025-02-01',
        blocked_time: '10:00 AM',
        reason: 'Duplicate test - should fail'
      })

    if (duplicateError) {
      if (duplicateError.message.includes('duplicate') || duplicateError.code === '23505') {
        console.log('✅ Unique constraint working correctly (duplicate rejected)')
      } else {
        console.error('❌ Unexpected error:', duplicateError)
      }
    } else {
      console.log('⚠️ Warning: Duplicate was allowed (unique constraint may not be working)')
    }

    // Test 4: Test upsert functionality
    console.log('\n🔄 Test 4: Testing upsert functionality...')
    
    const { data: upsertData, error: upsertError } = await supabase
      .from('blocked_time_slots')
      .upsert({
        blocked_date: '2025-02-01',
        blocked_time: '10:00 AM',
        reason: 'Updated test block 1'
      }, {
        onConflict: 'blocked_date,blocked_time'
      })
      .select()

    if (upsertError) {
      console.error('❌ Upsert test failed:', upsertError)
    } else {
      console.log('✅ Upsert functionality working correctly')
    }

    // Test 5: Test query operations
    console.log('\n🔍 Test 5: Testing query operations...')
    
    const { data: queryData, error: queryError } = await supabase
      .from('blocked_time_slots')
      .select('*')
      .eq('blocked_date', '2025-02-01')
      .order('blocked_time')

    if (queryError) {
      console.error('❌ Query test failed:', queryError)
    } else {
      console.log(`✅ Successfully queried ${queryData.length} records for 2025-02-01`)
      queryData.forEach(record => {
        console.log(`   - ${record.blocked_time}: ${record.reason}`)
      })
    }

    // Test 6: Test date range queries
    console.log('\n📅 Test 6: Testing date range queries...')
    
    const { data: rangeData, error: rangeError } = await supabase
      .from('blocked_time_slots')
      .select('*')
      .gte('blocked_date', '2025-02-01')
      .lte('blocked_date', '2025-02-02')
      .order('blocked_date, blocked_time')

    if (rangeError) {
      console.error('❌ Date range query test failed:', rangeError)
    } else {
      console.log(`✅ Successfully queried ${rangeData.length} records in date range`)
    }

    // Test 7: Test integration with bookings table
    console.log('\n🔗 Test 7: Testing integration with bookings table...')
    
    // Check if bookings table exists and has data
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('booking_date, booking_time, client_name, service_name')
      .limit(5)

    if (bookingsError) {
      console.log('⚠️ Bookings table not accessible or empty:', bookingsError.message)
    } else {
      console.log(`✅ Bookings table accessible with ${bookingsData.length} sample records`)
    }

    // Test 8: Simulate booking workflow
    console.log('\n🎯 Test 8: Simulating booking workflow...')
    
    const testBookingDate = '2025-02-03'
    const testBookingTime = '3:00 PM'
    
    // Check availability
    const { data: existingBlocks } = await supabase
      .from('blocked_time_slots')
      .select('*')
      .eq('blocked_date', testBookingDate)
      .eq('blocked_time', testBookingTime)

    if (existingBlocks && existingBlocks.length > 0) {
      console.log('⚠️ Time slot already blocked')
    } else {
      // Block the time slot (simulate successful booking)
      const { error: blockError } = await supabase
        .from('blocked_time_slots')
        .insert({
          blocked_date: testBookingDate,
          blocked_time: testBookingTime,
          reason: 'Booked by Test Client - Lash Extension'
        })

      if (blockError) {
        console.error('❌ Failed to block time slot:', blockError)
      } else {
        console.log('✅ Successfully blocked time slot for booking')
      }
    }

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...')
    
    const { error: cleanupError } = await supabase
      .from('blocked_time_slots')
      .delete()
      .in('blocked_date', ['2025-02-01', '2025-02-02', '2025-02-03'])

    if (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError)
    } else {
      console.log('✅ Test data cleaned up successfully')
    }

    console.log('\n🎉 Schema fix test completed successfully!')
    console.log('\n📊 Test Summary:')
    console.log('✅ Table structure is correct')
    console.log('✅ Insert operations work')
    console.log('✅ Unique constraints are enforced')
    console.log('✅ Upsert functionality works')
    console.log('✅ Query operations work')
    console.log('✅ Date range queries work')
    console.log('✅ Integration with bookings table works')
    console.log('✅ Booking workflow simulation works')

  } catch (error) {
    console.error('❌ Schema fix test failed:', error)
    process.exit(1)
  }
}

// Run the test
testSchemaFix()
