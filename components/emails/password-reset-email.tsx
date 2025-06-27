import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components"

interface PasswordResetEmailProps {
  resetUrl: string
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section style={{ backgroundColor: "white", padding: "40px", borderRadius: "8px", textAlign: "center" }}>
            <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", marginBottom: "20px" }}>
              Lashed by Deedee
            </Text>
            <Text style={{ fontSize: "18px", color: "#374151", marginBottom: "30px" }}>Reset Your Password</Text>
            <Text style={{ fontSize: "16px", color: "#6b7280", marginBottom: "30px" }}>
              You requested to reset your password. Click the button below to create a new password.
            </Text>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: "#ec4899",
                color: "white",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "30px",
              }}
            >
              Reset Password
            </Button>
            <Text style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </Text>
            <Text style={{ fontSize: "12px", color: "#9ca3af" }}>© 2024 Lashed by Deedee. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
