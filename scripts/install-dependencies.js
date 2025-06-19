console.log("📦 CHECKING DEPENDENCIES")
console.log("========================")

const fs = require("fs")
const path = require("path")

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), "package.json")
if (fs.existsSync(packageJsonPath)) {
  console.log("✅ package.json found")

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
    console.log("📋 Project name:", packageJson.name || "Unknown")

    // Check for Supabase dependency
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    if (deps["@supabase/supabase-js"]) {
      console.log("✅ @supabase/supabase-js found in package.json:", deps["@supabase/supabase-js"])
    } else {
      console.log("❌ @supabase/supabase-js NOT found in package.json")
      console.log("💡 Run: npm install @supabase/supabase-js")
    }

    // Check node_modules
    const nodeModulesPath = path.join(process.cwd(), "node_modules", "@supabase", "supabase-js")
    if (fs.existsSync(nodeModulesPath)) {
      console.log("✅ @supabase/supabase-js installed in node_modules")
    } else {
      console.log("❌ @supabase/supabase-js NOT installed in node_modules")
      console.log("💡 Run: npm install")
    }
  } catch (error) {
    console.log("❌ Error reading package.json:", error.message)
  }
} else {
  console.log("❌ package.json not found")
  console.log("💡 Make sure you're in the project root directory")
}

console.log("\n🔧 RECOMMENDED STEPS:")
console.log("1. Make sure you're in the project root directory")
console.log("2. Run: npm install")
console.log("3. Run: node scripts/simple-connection-test.js")
