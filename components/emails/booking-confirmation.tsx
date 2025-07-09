import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from "@react-email/components"

interface BookingConfirmationEmailProps {
  customerName: string
  customerEmail: string
  customerPhone: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  reference: string
  notes?: string
}

export function BookingConfirmationEmail({
  customerName,
  customerEmail,
  customerPhone,
  services,
  bookingDate,
  bookingTime,
  totalAmount,
  depositAmount,
  reference,
  notes,
}: BookingConfirmationEmailProps) {
  const balanceAmount = totalAmount - depositAmount
  const formattedDate = new Date(bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Html>
      <Head />
      <Preview>Your booking with Lashed by Deedee has been confirmed! ✨</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={brandTitle}>Lashed by Deedee</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Booking Confirmed! 💕</Heading>

            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Thank you for booking with Lashed by Deedee! Your appointment has been confirmed.
            </Text>

            {/* Booking Details */}
            <Section style={bookingDetails}>
              <Heading style={h2}>Booking Details</Heading>
              <Text style={detailItem}>
                <span style={label}>Services:</span> {services.join(", ")}
              </Text>
              <Text style={detailItem}>
                <span style={label}>Date:</span> {formattedDate}
              </Text>
              <Text style={detailItem}>
                <span style={label}>Time:</span> {bookingTime}
              </Text>
              <Text style={detailItem}>
                <span style={label}>Total Amount:</span> ₦{totalAmount.toLocaleString()}
              </Text>
              <Text style={detailItem}>
                <span style={label}>Deposit Required:</span> ₦{depositAmount.toLocaleString()}
              </Text>
            </Section>

            {notes && (
              <Section style={notesSection}>
                <Text style={notesText}>
                  <strong>Special Notes:</strong> {notes}
                </Text>
              </Section>
            )}

            {/* Contact Information */}
            <Section style={contactInfo}>
              <Heading style={h2}>Contact Information</Heading>
              <Text style={contactItem}>
                📍 <span style={label}>Location:</span> Rumigbo, Port Harcourt, Rivers State
              </Text>
              <Text style={contactItem}>
                📱 <span style={label}>WhatsApp:</span>{" "}
                <Link href="#" style={linkStyle}>
                  Contact Us
                </Link>
              </Text>
              <Text style={contactItem}>
                📧 <span style={label}>Email:</span>{" "}
                <Link href="mailto:bookings@lashedbydeedee.com" style={linkStyle}>
                  bookings@lashedbydeedee.com
                </Link>
              </Text>
              <Text style={contactItem}>
                📸 <span style={label}>Instagram:</span>{" "}
                <Link href="https://instagram.com/lashedbydeedee" style={linkStyle}>
                  @lashedbydeedee
                </Link>
              </Text>
            </Section>

            <Text style={paragraph}>
              We can't wait to see you! If you have any questions, please don't hesitate to reach out.
            </Text>

            <Text style={signature}>
              Best regards,
              <br />
              Deedee
              <br />
              <em>Lashed by Deedee ✨</em>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>© 2024 Lashed by Deedee. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  marginBottom: "64px",
  maxWidth: "600px",
}

const header = {
  backgroundColor: "#000000",
  padding: "40px 24px",
  textAlign: "center" as const,
}

const brandTitle = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "center" as const,
}

const content = {
  padding: "40px 24px",
}

const h1 = {
  color: "#374151",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 24px",
  textAlign: "center" as const,
}

const h2 = {
  color: "#374151",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
}

const greeting = {
  color: "#374151",
  fontSize: "18px",
  fontWeight: "600",
  margin: "24px 0 16px",
}

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const bookingDetails = {
  backgroundColor: "#e3f2fd",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
}

const contactInfo = {
  backgroundColor: "#e3f2fd",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
}

const detailItem = {
  color: "#374151",
  fontSize: "16px",
  margin: "8px 0",
}

const contactItem = {
  color: "#374151",
  fontSize: "16px",
  margin: "8px 0",
}

const label = {
  fontWeight: "600",
  color: "#7c2d92",
}

const linkStyle = {
  color: "#ec4899",
  textDecoration: "none",
}

const notesSection = {
  backgroundColor: "#f3f4f6",
  padding: "16px",
  borderRadius: "6px",
  margin: "24px 0",
}

const notesText = {
  color: "#374151",
  fontSize: "16px",
  fontStyle: "italic",
  margin: "0",
}

const signature = {
  color: "#374151",
  fontSize: "16px",
  fontStyle: "italic",
  margin: "32px 0",
  textAlign: "center" as const,
}

const footer = {
  padding: "24px",
  textAlign: "center" as const,
  backgroundColor: "#f9fafb",
}

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0",
  textAlign: "center" as const,
}

export default BookingConfirmationEmail
