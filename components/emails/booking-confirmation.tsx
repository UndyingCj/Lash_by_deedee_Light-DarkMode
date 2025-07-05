import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components"

interface BookingConfirmationEmailProps {
  customerName: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference?: string
}

export function BookingConfirmationEmail({
  customerName,
  services,
  date,
  time,
  totalAmount,
  depositAmount,
  paymentReference,
}: BookingConfirmationEmailProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Html>
      <Head />
      <Preview>Your booking with Lashed by Deedee has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="/placeholder.svg?height=60&width=200&text=Lashed+by+Deedee"
              width="200"
              height="60"
              alt="Lashed by Deedee"
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Heading style={h1}>Booking Confirmed! 💕</Heading>

            <Text style={text}>Hi {customerName},</Text>

            <Text style={text}>Thank you for booking with Lashed by Deedee! Your appointment has been confirmed.</Text>

            <Section style={bookingDetails}>
              <Heading style={h2}>Booking Details</Heading>

              <Text style={detailItem}>
                <strong>Services:</strong> {services.join(", ")}
              </Text>

              <Text style={detailItem}>
                <strong>Date:</strong> {formattedDate}
              </Text>

              <Text style={detailItem}>
                <strong>Time:</strong> {time}
              </Text>

              <Text style={detailItem}>
                <strong>Total Amount:</strong> ₦{totalAmount.toLocaleString()}
              </Text>

              <Text style={detailItem}>
                <strong>Deposit Required:</strong> ₦{depositAmount.toLocaleString()}
              </Text>
              {paymentReference && (
                <Text style={detailItem}>
                  <strong>Payment Reference:</strong> {paymentReference}
                </Text>
              )}
            </Section>

            <Section style={importantInfo}>
              <Heading style={h3}>Important Information</Heading>

              <Text style={text}>• Please arrive 10 minutes early for your appointment</Text>

              <Text style={text}>
                • A deposit of ₦{depositAmount.toLocaleString()} is required to secure your booking
              </Text>

              <Text style={text}>• Cancellations must be made 24 hours in advance</Text>

              <Text style={text}>• Please come with clean lashes/brows (no makeup)</Text>
            </Section>

            <Section style={contactInfo}>
              <Heading style={h3}>Contact Information</Heading>

              <Text style={text}>
                📍 Location: Rumigbo, Port Harcourt, Rivers State
                <br />📞 WhatsApp:{" "}
                <a href="https://wa.me/message/X5M2NOA553NGK1" style={link}>
                  Contact Us
                </a>
                <br />📧 Email:{" "}
                <a href="mailto:bookings@lashedbydeedee.com" style={link}>
                  bookings@lashedbydeedee.com
                </a>
                <br />📱 Instagram:{" "}
                <a href="https://www.instagram.com/lashedbydeedee?igsh=MWR3NzV6amtpZHdwbg==" style={link}>
                  @lashedbydeedee
                </a>
              </Text>
            </Section>

            <Text style={text}>
              We can't wait to see you! If you have any questions, please don't hesitate to reach out.
            </Text>

            <Text style={signature}>
              Best regards,
              <br />
              Deedee
              <br />
              Lashed by Deedee ✨
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© 2024 Lashed by Deedee. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles remain the same...
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
  textAlign: "center" as const,
  backgroundColor: "#000000",
}

const logo = {
  margin: "0 auto",
}

const content = {
  padding: "24px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0 10px 0",
  padding: "0",
}

const h3 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0 10px 0",
  padding: "0",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
}

const bookingDetails = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const detailItem = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
}

const importantInfo = {
  backgroundColor: "#fff3cd",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
  border: "1px solid #ffeaa7",
}

const contactInfo = {
  backgroundColor: "#e3f2fd",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const link = {
  color: "#e91e63",
  textDecoration: "underline",
}

const signature = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "30px 0 0 0",
  fontStyle: "italic",
}

const footer = {
  textAlign: "center" as const,
  padding: "24px",
  backgroundColor: "#f8f9fa",
}

const footerText = {
  color: "#666",
  fontSize: "12px",
  lineHeight: "16px",
}
