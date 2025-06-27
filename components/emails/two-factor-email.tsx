import { Html, Head, Body, Container, Text, Section } from "@react-email/components"

interface TwoFactorEmailProps {
  code: string
}

export default function TwoFactorEmail({ code }: TwoFactorEmailProps) {
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
              🔐 Admin Login Verification
            </Text>

            <Text style={{ fontSize: "16px", color: "#4b5563", lineHeight: "1.5", marginBottom: "30px" }}>
              Someone is trying to access your Lashed by Deedee admin panel. If this was you, use the verification code
              below:
            </Text>

            <Section style={{ textAlign: "center", margin: "40px 0" }}>
              <Text
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#ec4899",
                  backgroundColor: "#fdf2f8",
                  padding: "20px 40px",
                  borderRadius: "8px",
                  letterSpacing: "4px",
                  border: "2px solid #f9a8d4",
                }}
              >
                {code}
              </Text>
            </Section>

            <Text style={{ fontSize: "14px", color: "#6b7280", textAlign: "center", marginBottom: "20px" }}>
              This code will expire in 10 minutes for security reasons.
            </Text>

            <Text style={{ fontSize: "14px", color: "#ef4444", textAlign: "center", marginBottom: "30px" }}>
              If you didn't request this code, please ignore this email and consider changing your password.
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
