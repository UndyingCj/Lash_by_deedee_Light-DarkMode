import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface PasswordResetEmailProps {
  resetUrl: string
  email: string
}

export default function PasswordResetEmail({ resetUrl, email }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your admin password</Preview>
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
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>Hi there,</Text>
          <Text style={text}>
            We received a request to reset the password for your Lashed by Deedee admin account ({email}).
          </Text>
          <Text style={text}>Click the button below to reset your password:</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          <Text style={text}>
            If the button doesn't work, you can also copy and paste the following link into your browser:
          </Text>
          <Text style={linkText}>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Text>
          <Text style={text}>This link will expire in 1 hour for security reasons.</Text>
          <Text style={text}>
            If you didn't request a password reset, please ignore this email or contact us if you have concerns about
            your account security.
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

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#ec4899",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
}

const linkText = {
  fontSize: "14px",
  color: "#666",
  lineHeight: "24px",
  wordBreak: "break-all" as const,
}

const link = {
  color: "#ec4899",
  textDecoration: "underline",
}

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "40px 0 0",
}
