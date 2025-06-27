import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components"

interface PasswordResetEmailProps {
  resetUrl: string
  name?: string
}

export default function PasswordResetEmail({ resetUrl, name = "Admin" }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section style={{ textAlign: "center", marginBottom: "30px" }}>
            <Text style={{ color: "#ec4899", fontSize: "24px", fontWeight: "bold", margin: "0" }}>
              Lashed by Deedee
            </Text>
            <Text style={{ color: "#666", margin: "5px 0" }}>Admin Portal</Text>
          </Section>

          <Section style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
            <Text style={{ color: "#1f2937", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
              Reset Your Password
            </Text>
            <Text style={{ color: "#4b5563", marginBottom: "30px" }}>
              Hi {name}, you requested to reset your password. Click the button below to create a new password:
            </Text>

            <Section style={{ textAlign: "center", margin: "30px 0" }}>
              <Button
                href={resetUrl}
                style={{
                  backgroundColor: "#ec4899",
                  color: "white",
                  padding: "12px 30px",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  display: "inline-block",
                }}
              >
                Reset Password
              </Button>
            </Section>

            <Text style={{ color: "#6b7280", fontSize: "14px" }}>
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </Text>

            <Section style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
              <Text style={{ color: "#9ca3af", fontSize: "12px", margin: "0" }}>
                If the button doesn't work, copy and paste this link into your browser:
              </Text>
              <Text style={{ color: "#6b7280", fontSize: "12px", wordBreak: "break-all", margin: "5px 0" }}>
                {resetUrl}
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
