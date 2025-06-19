import fetch from "node-fetch"
import fs from "fs"

async function analyzeSecurityReport() {
  try {
    console.log("📊 Fetching Supabase Security Report...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Supabase%20Performance%20Security%20Lints%20%28cqnfxvgdamevrvlniryr%29-QmfIwSlBA3HA2hCfdljnHkloK6TfRF.csv",
    )
    const csvContent = await response.text()

    console.log("📋 Raw CSV Content:")
    console.log(csvContent)

    // Parse CSV manually (simple approach)
    const lines = csvContent.split("\n")
    const headers = lines[0].split(",")
    const issues = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",")
        const issue = {}
        headers.forEach((header, index) => {
          issue[header.replace(/"/g, "")] = values[index]?.replace(/"/g, "") || ""
        })
        issues.push(issue)
      }
    }

    console.log("\n🔍 Security Issues Found:")
    console.log("========================")

    const errorIssues = issues.filter((issue) => issue.level === "ERROR")
    const warningIssues = issues.filter((issue) => issue.level === "WARN")

    console.log(`\n❌ ERRORS (${errorIssues.length}):`)
    errorIssues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.title}`)
      console.log(`   Table: ${issue.detail}`)
      console.log(`   Category: ${issue.categories}`)
      console.log(`   Fix: ${issue.remediation}`)
    })

    console.log(`\n⚠️  WARNINGS (${warningIssues.length}):`)
    warningIssues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.title}`)
      console.log(`   Detail: ${issue.detail}`)
      console.log(`   Category: ${issue.categories}`)
    })

    // Generate fix script
    console.log("\n🔧 Generating Security Fix Script...")

    const rlsIssues = issues.filter((issue) => issue.name === "rls_disabled_in_public")

    let fixScript = `-- SUPABASE SECURITY FIXES
-- Generated from security lint report
-- Run this in your Supabase SQL Editor

`

    rlsIssues.forEach((issue) => {
      const metadata = JSON.parse(issue.metadata || "{}")
      const tableName = metadata.name

      fixScript += `-- Fix RLS for ${tableName}
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role full access to ${tableName}" ON public.${tableName}
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users if needed
CREATE POLICY "Authenticated users can read ${tableName}" ON public.${tableName}
  FOR SELECT
  TO authenticated
  USING (true);

`
    })

    fixScript += `
-- Verify RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (${rlsIssues.map((issue) => `'${JSON.parse(issue.metadata).name}'`).join(", ")});
`

    // Save fix script
    fs.writeFileSync("scripts/fix-security-issues.sql", fixScript)
    console.log("✅ Security fix script saved to: scripts/fix-security-issues.sql")

    console.log("\n📋 SUMMARY:")
    console.log("===========")
    console.log(`Total Issues: ${issues.length}`)
    console.log(`Errors: ${errorIssues.length}`)
    console.log(`Warnings: ${warningIssues.length}`)
    console.log(`RLS Issues: ${rlsIssues.length}`)

    console.log("\n🎯 NEXT STEPS:")
    console.log("==============")
    console.log("1. Review the security issues above")
    console.log("2. Run: scripts/fix-security-issues.sql in Supabase SQL Editor")
    console.log("3. Re-run the security linter in Supabase Dashboard")
    console.log("4. Test your application functionality")
  } catch (error) {
    console.error("❌ Error analyzing security report:", error)
  }
}

analyzeSecurityReport()
