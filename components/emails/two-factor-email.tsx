import { Html, Head, Body, Container, Text, Section, Hr } from "@react-email/components"

interface TwoFactorEmailProps {
  code: string
}

export default function TwoFactorEmail({ code }: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>Lashed by Deedee</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Your Verification Code</Text>
            <Text style={text}>Use the following verification code to complete your login:</Text>

            <Section style={codeContainer}>
              <Text style={codeText}>{code}</Text>
            </Section>

            <Text style={text}>
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>© 2024 Lashed by Deedee. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const header = {
  padding: "32px 24px",
  backgroundColor: "#ec4899",
}

const title = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
}

const content = {
  padding: "24px",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1f2937",
  margin: "0 0 16px",
}

const text = {
  fontSize: "16px",
  color: "#374151",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const codeContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
}

const codeText = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#1f2937",
  letterSpacing: "4px",
  margin: "0",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
}

const footer = {
  padding: "0 24px",
}

const footerText = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: "0",
}
