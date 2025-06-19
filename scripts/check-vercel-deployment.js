console.log("🚀 Vercel Deployment Checker")
console.log("============================")

// This script helps you identify common deployment issues

console.log("📋 DEPLOYMENT CHECKLIST:")
console.log("========================")

console.log("\n1. ✅ Environment Variables (Check in Vercel Dashboard):")
console.log("   - NEXT_PUBLIC_SUPABASE_URL")
console.log("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
console.log("   - SUPABASE_SERVICE_ROLE_KEY")

console.log("\n2. ✅ Build Process:")
console.log("   - Check Vercel build logs for errors")
console.log("   - Ensure all dependencies are installed")
console.log("   - No TypeScript errors")

console.log("\n3. ✅ API Routes:")
console.log("   - /api/admin/availability should exist")
console.log("   - /api/admin/stats should exist")
console.log("   - /api/admin/bookings should exist")

console.log("\n4. ✅ Database Connection:")
console.log("   - Supabase project is active")
console.log("   - RLS policies are correct")
console.log("   - Tables exist and have data")

console.log("\n🔧 COMMON FIXES:")
console.log("================")

console.log('\n❌ If calendar shows "Loading availability data...":')
console.log("   → Environment variables missing in Vercel")
console.log("   → API route returning errors")
console.log("   → Database connection issues")

console.log("\n❌ If you get 404 errors:")
console.log("   → API routes not deployed properly")
console.log("   → Check Vercel function logs")

console.log("\n❌ If you get CORS errors:")
console.log("   → Add proper headers to API routes")
console.log("   → Check Supabase CORS settings")

console.log("\n🎯 NEXT STEPS:")
console.log("==============")
console.log("1. Run: node scripts/test-live-site.js")
console.log("2. Check Vercel Dashboard > Functions > Logs")
console.log("3. Check browser console on live site (F12)")
console.log("4. Verify environment variables in Vercel")

console.log("\n💡 Quick Debug:")
console.log("Open https://lashedbydeedee.com/egusi/calendar")
console.log("Press F12 → Console tab")
console.log("Look for red error messages")
