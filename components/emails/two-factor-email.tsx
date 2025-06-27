import { Html, Head, Body, Container, Text, Section } from "@react-email/components"

interface TwoFactorEmailProps {
  code: string
}

export function TwoFactorEmail({ code }: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section style={{ backgroundColor: "white", padding: "40px", borderRadius: "8px", textAlign: "center" }}>
            <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", marginBottom: "20px" }}>
              Lashed by Deedee
            </Text>
            <Text style={{ fontSize: "18px", color: "#374151", marginBottom: "30px" }}>Your verification code is:</Text>
            <Text
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#ec4899",
                backgroundColor: "#fdf2f8",
                padding: "20px",
                borderRadius: "8px",
                letterSpacing: "4px",
                marginBottom: "30px",
              }}
            >
              {code}
            </Text>
            <Text style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </Text>
            <Text style={{ fontSize: "12px", color: "#9ca3af" }}>© 2024 Lashed by Deedee. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
