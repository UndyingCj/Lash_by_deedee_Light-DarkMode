import { Html, Head, Body, Container, Text, Button, Section, Hr } from "@react-email/components"

interface PasswordResetEmailProps {
  resetUrl: string
  name: string
}

export default function PasswordResetEmail({ resetUrl, name }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>Lashed by Deedee</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Reset Your Password</Text>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              We received a request to reset your password for your Lashed by Deedee admin account.
            </Text>
            <Text style={text}>Click the button below to reset your password:</Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            <Text style={text}>
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </Text>

            <Text style={smallText}>
              If the button doesn't work, copy and paste this link into your browser:
              <br />
              {resetUrl}
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

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#ec4899",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const smallText = {
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: "20px",
  margin: "16px 0 0",
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
