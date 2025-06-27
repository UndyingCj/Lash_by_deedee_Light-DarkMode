import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface TwoFactorEmailProps {
  code: string
}

export function TwoFactorEmail({ code }: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your two-factor authentication code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Two-Factor Authentication</Heading>
          <Text style={text}>Your verification code is:</Text>
          <Section style={codeContainer}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Text style={text}>
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </Text>
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

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
}

const codeContainer = {
  background: "#f4f4f4",
  borderRadius: "4px",
  margin: "16px auto",
  padding: "24px",
  textAlign: "center" as const,
}

const codeText = {
  color: "#000",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "6px",
  lineHeight: "40px",
  margin: "0",
  fontFamily: "monospace",
}
