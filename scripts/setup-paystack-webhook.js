// Script to help you set up the Paystack webhook
console.log("🔧 Paystack Webhook Setup Instructions\n")

console.log("📋 To fix the email issue, you need to set up a Paystack webhook:")
console.log("")

console.log("1️⃣ Go to your Paystack Dashboard:")
console.log("   https://dashboard.paystack.co/")
console.log("")

console.log("2️⃣ Navigate to Settings > Webhooks")
console.log("")

console.log("3️⃣ Add a new webhook with these details:")
console.log("   URL: https://lashedbydeedee.com/api/payments/webhook")
console.log("   Events: charge.success")
console.log("")

console.log("4️⃣ Save the webhook")
console.log("")

console.log("✨ Why this fixes the email issue:")
console.log("   - Paystack will automatically call your webhook when payment succeeds")
console.log("   - The webhook will send both customer and admin emails")
console.log("   - This ensures emails are sent even if the verification fails")
console.log("")

console.log("🔍 After setting up the webhook:")
console.log("   1. Make a test booking on your live site")
console.log("   2. Complete the payment")
console.log("   3. Check both email inboxes")
console.log("   4. You should receive both Paystack AND custom emails")
console.log("")

console.log("📧 Expected emails after webhook setup:")
console.log("   ✅ Paystack receipt email (you already get this)")
console.log("   ✅ Beautiful customer confirmation email")
console.log("   ✅ Admin notification email with booking details")
