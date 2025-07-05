import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components"

interface BookingConfirmationEmailProps {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference?: string
}

export default function BookingConfirmationEmail({
  customerName,
  services,
  date,
  time,
  totalAmount,
  depositAmount,
  paymentReference,
}: BookingConfirmationEmailProps) {
  const formattedDate = new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
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
            <Heading style={h1}>Booking Confirmed! ✨</Heading>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Thank you for your booking! Your appointment has been confirmed and your deposit has been received.
            </Text>
          </Section>

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
              <strong>Total Cost:</strong> ₦{totalAmount.toLocaleString()}
            </Text>

            <Text style={detailItem}>
              <strong>Deposit Paid:</strong> ₦{depositAmount.toLocaleString()}
            </Text>

            <Text style={detailItem}>
              <strong>Balance Due:</strong> ₦{(totalAmount - depositAmount).toLocaleString()}
            </Text>

            {paymentReference && (
              <Text style={detailItem}>
                <strong>Payment Reference:</strong> {paymentReference}
              </Text>
            )}
          </Section>

          <Section style={importantInfo}>
            <Heading style={h2}>Important Reminders</Heading>
            <Text style={text}>• Please arrive on time. Late arrivals (1+ hour) will result in rescheduling</Text>
            <Text style={text}>• Avoid wearing makeup to your appointment for best results</Text>
            <Text style={text}>• You can reschedule once - missing after rescheduling forfeits your deposit</Text>
            <Text style={text}>• 24 hours notice required for cancellations</Text>
          </Section>

          <Section style={contact}>
            <Text style={text}>
              Questions? Contact us on{" "}
              <Link href="https://wa.me/2348165435528" style={link}>
                WhatsApp
              </Link>{" "}
              or email{" "}
              <Link href="mailto:bookings@lashedbydeedee.com" style={link}>
                bookings@lashedbydeedee.com
              </Link>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>Lashed by Deedee - Premium Lash & Brow Services</Text>
            <Text style={footerText}>
              Follow us on{" "}
              <Link href="https://instagram.com/lashedbydeedee" style={link}>
                Instagram
              </Link>
            </Text>
          </Section>
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

const header = {
  padding: "32px 24px",
  textAlign: "center" as const,
}

const h1 = {
  color: "#ec4899",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
}

const h2 = {
  color: "#374151",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
}

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const bookingDetails = {
  backgroundColor: "#fdf2f8",
  border: "1px solid #fce7f3",
  borderRadius: "8px",
  margin: "24px 24px",
  padding: "24px",
}

const detailItem = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px",
}

const importantInfo = {
  margin: "24px 24px",
  padding: "0 24px",
}

const contact = {
  margin: "24px 24px",
  padding: "0 24px",
  textAlign: "center" as const,
}

const footer = {
  borderTop: "1px solid #e5e7eb",
  margin: "24px 24px 0",
  padding: "24px 24px 0",
  textAlign: "center" as const,
}

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0 0 8px",
}

const link = {
  color: "#ec4899",
  textDecoration: "underline",
}
