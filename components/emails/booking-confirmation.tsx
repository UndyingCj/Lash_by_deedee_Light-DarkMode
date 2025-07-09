import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

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
  const formattedDate = new Date(bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
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
          <Section style={logoContainer}>
            <Img
              src="https://lashedbydeedee.com/placeholder-logo.png"
              width="150"
              height="50"
              alt="Lashed by Deedee"
              style={logo}
            />
          </Section>

          <Heading style={h1}>Booking Confirmed! ✨</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>
            Thank you for booking with Lashed by Deedee! Your appointment has been confirmed and your deposit has been
            received.
          </Text>

          <Section style={bookingDetails}>
            <Heading style={h2}>Booking Details</Heading>

            <Text style={detailText}>
              <strong>Date:</strong> {formattedDate}
            </Text>
            <Text style={detailText}>
              <strong>Time:</strong> {bookingTime}
            </Text>
            <Text style={detailText}>
              <strong>Services:</strong> {services.join(", ")}
            </Text>
            <Text style={detailText}>
              <strong>Total Amount:</strong> ₦{totalAmount.toLocaleString()}
            </Text>
            <Text style={detailText}>
              <strong>Deposit Paid:</strong> ₦{depositAmount.toLocaleString()}
            </Text>
            <Text style={detailText}>
              <strong>Balance Due:</strong> ₦{(totalAmount - depositAmount).toLocaleString()}
            </Text>
            <Text style={detailText}>
              <strong>Payment Reference:</strong> {reference}
            </Text>
            {notes && (
              <Text style={detailText}>
                <strong>Notes:</strong> {notes}
              </Text>
            )}
          </Section>

          <Section style={importantInfo}>
            <Heading style={h3}>Important Reminders</Heading>
            <Text style={text}>• Please arrive 10 minutes before your appointment time</Text>
            <Text style={text}>• Avoid wearing makeup to ensure the best results</Text>
            <Text style={text}>
              • The remaining balance of ₦{(totalAmount - depositAmount).toLocaleString()} is due at your appointment
            </Text>
            <Text style={text}>• If you need to reschedule, please contact us at least 24 hours in advance</Text>
          </Section>

          <Section style={contactInfo}>
            <Heading style={h3}>Contact Information</Heading>
            <Text style={text}>
              📱 WhatsApp: <Link href="https://wa.me/2348165435528">+234 816 543 5528</Link>
            </Text>
            <Text style={text}>📧 Email: info@lashedbydeedee.com</Text>
            <Text style={text}>
              🌐 Website: <Link href="https://lashedbydeedee.com">lashedbydeedee.com</Link>
            </Text>
          </Section>

          <Text style={footer}>
            We can't wait to see you! ✨<br />
            The Lashed by Deedee Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingConfirmationEmail

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
  marginBottom: "32px",
}

const logo = {
  margin: "0 auto",
}

const h1 = {
  color: "#ec4899",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
}

const h2 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0 10px 0",
}

const h3 = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0 10px 0",
}

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "10px 0",
}

const detailText = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
}

const bookingDetails = {
  backgroundColor: "#fef7ff",
  border: "1px solid #f3e8ff",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const importantInfo = {
  backgroundColor: "#fef3f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const contactInfo = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "30px 0 0 0",
}
