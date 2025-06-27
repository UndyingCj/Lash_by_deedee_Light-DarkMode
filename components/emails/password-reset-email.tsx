import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components"

interface PasswordResetEmailProps {
  resetUrl: string
}

export default function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Text
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              🔑 Reset Your Password
            </Text>

            <Text style={{ fontSize: "16px", color: "#4b5563", lineHeight: "1.5", marginBottom: "30px" }}>
              You requested to reset your password for your Lashed by Deedee admin account. Click the button below to
              create a new password:
            </Text>

            <Section style={{ textAlign: "center", margin: "40px 0" }}>
              <Button
                href={resetUrl}
                style={{
                  backgroundColor: "#ec4899",
                  color: "white",
                  padding: "16px 32px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "16px",
                  display: "inline-block",
                }}
              >
                Reset Password
              </Button>
            </Section>

            <Text style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              If the button doesn't work, copy and paste this link into your browser:
            </Text>

            <Text
              style={{
                fontSize: "12px",
                color: "#3b82f6",
                backgroundColor: "#f0f9ff",
                padding: "10px",
                borderRadius: "4px",
                wordBreak: "break-all",
                marginBottom: "30px",
              }}
            >
              {resetUrl}
            </Text>

            <Text style={{ fontSize: "14px", color: "#ef4444", marginBottom: "20px" }}>
              This link will expire in 1 hour for security reasons.
            </Text>

            <Text style={{ fontSize: "14px", color: "#6b7280", marginBottom: "30px" }}>
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </Text>

            <Section style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", textAlign: "center" }}>
              <Text style={{ fontSize: "12px", color: "#9ca3af" }}>
                Lashed by Deedee Admin System
                <br />
                This is an automated security email.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
