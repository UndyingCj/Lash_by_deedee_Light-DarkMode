import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Row, Column } from "@react-email/components"

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
          <Section style={header}>
            <Heading style={h1}>✨ Booking Confirmed!</Heading>
            <Text style={subtitle}>Thank you for choosing Lashed by Deedee</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Great news! Your booking has been confirmed and your deposit payment has been processed successfully.
            </Text>

            <Section style={bookingDetails}>
              <Heading style={h2}>📅 Booking Details</Heading>
              <Row>
                <Column>
                  <Text style={label}>Date:</Text>
                  <Text style={value}>{formattedDate}</Text>
                </Column>
                <Column>
                  <Text style={label}>Time:</Text>
                  <Text style={value}>{bookingTime}</Text>
                </Column>
              </Row>
              <Text style={label}>Services:</Text>
              <Text style={value}>{services.join(", ")}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={paymentDetails}>
              <Heading style={h2}>💰 Payment Summary</Heading>
              <Row>
                <Column>
                  <Text style={label}>Total Amount:</Text>
                  <Text style={value}>₦{totalAmount.toLocaleString()}</Text>
                </Column>
                <Column>
                  <Text style={label}>Deposit Paid:</Text>
                  <Text style={value}>₦{depositAmount.toLocaleString()}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={label}>Balance Due:</Text>
                  <Text style={balanceText}>₦{balanceAmount.toLocaleString()}</Text>
                </Column>
                <Column>
                  <Text style={label}>Reference:</Text>
                  <Text style={referenceText}>{reference}</Text>
                </Column>
              </Row>
            </Section>

            {notes && (
              <>
                <Hr style={divider} />
                <Section>
                  <Heading style={h2}>📝 Special Notes</Heading>
                  <Text style={notesText}>{notes}</Text>
                </Section>
              </>
            )}

            <Hr style={divider} />

            <Section style={importantInfo}>
              <Heading style={h2}>⚠️ Important Information</Heading>
              <Text style={paragraph}>
                • Please arrive 10 minutes before your appointment time
                <br />• The remaining balance of ₦{balanceAmount.toLocaleString()} is due at your appointment
                <br />• If you need to reschedule, please contact us at least 24 hours in advance
                <br />• Bring a valid ID and your payment reference: {reference}
              </Text>
            </Section>

            <Section style={contactInfo}>
              <Heading style={h2}>📞 Contact Information</Heading>
              <Text style={paragraph}>
                If you have any questions or need to make changes to your booking, please contact us:
                <br />
                <br />📧 Email: bookings@lashedbydeedee.com
                <br />📱 Phone: +234 XXX XXX XXXX
                <br />🌐 Website: lashedbydeedee.com
              </Text>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Thank you for choosing Lashed by Deedee! We can't wait to make you look and feel amazing. ✨
            </Text>
            <Text style={footerText}>© 2025 Lashed by Deedee. All rights reserved.</Text>
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
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const header = {
  padding: "32px 24px",
  textAlign: "center" as const,
  backgroundColor: "#fdf2f8",
}

const h1 = {
  color: "#ec4899",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 8px",
  textAlign: "center" as const,
}

const subtitle = {
  color: "#6b7280",
  fontSize: "16px",
  margin: "0",
  textAlign: "center" as const,
}

const content = {
  padding: "0 24px",
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
  backgroundColor: "#f9fafb",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
}

const paymentDetails = {
  backgroundColor: "#f0fdf4",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
}

const importantInfo = {
  backgroundColor: "#fef3c7",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
}

const contactInfo = {
  backgroundColor: "#eff6ff",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
}

const h2 = {
  color: "#374151",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
}

const label = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 4px",
}

const value = {
  color: "#374151",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px",
}

const balanceText = {
  color: "#dc2626",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 16px",
}

const referenceText = {
  color: "#059669",
  fontSize: "14px",
  fontWeight: "600",
  fontFamily: "monospace",
  margin: "0 0 16px",
}

const notesText = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  fontStyle: "italic",
  backgroundColor: "#f3f4f6",
  padding: "16px",
  borderRadius: "6px",
  margin: "0",
}

const divider = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
}

const footer = {
  padding: "32px 24px",
  textAlign: "center" as const,
  backgroundColor: "#f9fafb",
}

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "8px 0",
  textAlign: "center" as const,
}

export default BookingConfirmationEmail
