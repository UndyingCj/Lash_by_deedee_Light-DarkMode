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
          <Section style={{ textAlign: "center", marginBottom: "30px" }}>
            <Text style={{ color: "#ec4899", fontSize: "24px", fontWeight: "bold", margin: "0" }}>
              Lashed by Deedee
            </Text>
            <Text style={{ color: "#666", margin: "5px 0" }}>Admin Portal</Text>
          </Section>

          <Section style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
            <Text style={{ color: "#1f2937", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
              Two-Factor Authentication
            </Text>
            <Text style={{ color: "#4b5563", marginBottom: "30px" }}>Use this code to complete your login:</Text>

            <Section
              style={{
                backgroundColor: "#f9fafb",
                padding: "20px",
                borderRadius: "6px",
                margin: "20px 0",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  letterSpacing: "8px",
                  color: "#ec4899",
                  fontFamily: "monospace",
                  margin: "0",
                }}
              >
                {code}
              </Text>
            </Section>

            <Text style={{ color: "#6b7280", fontSize: "14px", marginTop: "20px" }}>
              This code will expire in 10 minutes.
            </Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "30px" }}>
            <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
              If you didn't request this code, please ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
