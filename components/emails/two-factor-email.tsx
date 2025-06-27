import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components"

interface TwoFactorEmailProps {
  code: string
}

export default function TwoFactorEmail({ code }: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your admin login verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://lashedbydeedee.com/placeholder-logo.png"
              width="120"
              height="36"
              alt="Lashed by Deedee"
              style={logo}
            />
          </Section>
          <Heading style={h1}>Admin Login Verification</Heading>
          <Text style={text}>
            Someone is trying to sign in to your Lashed by Deedee admin account. If this was you, please use the
            verification code below:
          </Text>
          <Section style={codeContainer}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Text style={text}>This code will expire in 10 minutes.</Text>
          <Text style={text}>
            If you didn't request this code, please ignore this email or contact us if you have concerns about your
            account security.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The Lashed by Deedee Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
}

const logoContainer = {
  textAlign: "center" as const,
  margin: "0 0 40px",
}

const logo = {
  margin: "0 auto",
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
  margin: "16px 0",
}

const codeContainer = {
  background: "#f4f4f4",
  borderRadius: "4px",
  margin: "16px auto 40px",
  padding: "24px",
  textAlign: "center" as const,
}

const codeText = {
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "6px",
  color: "#333",
  margin: "0",
}

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "40px 0 0",
}
