import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link } from "@react-email/components"

interface AdminBookingNotificationEmailProps {
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

export function AdminBookingNotificationEmail({
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
}: AdminBookingNotificationEmailProps) {
  const formattedDate = new Date(bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Html>
      <Head />
      <Preview>
        New booking received from {customerName} for {formattedDate}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>New Booking Received! 🎉</Heading>
            <Hr style={headerDivider} />
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Customer Details */}
            <Section style={customerSection}>
              <Heading style={h2}>Customer Details</Heading>
              <Text style={detailItem}>
                <span style={label}>Name:</span> {customerName}
              </Text>
              <Text style={detailItem}>
                <span style={label}>Email:</span>{" "}
                <Link href={`mailto:${customerEmail}`} style={linkStyle}>
                  {customerEmail}
                </Link>
              </Text>
              <Text style={detailItem}>
                <span style={label}>Phone:</span> {customerPhone}
              </Text>
            </Section>

            {/* Booking Details */}
            <Section style={bookingSection}>
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
              <Text style={detailItem}>
                <span style={label}>Payment Reference:</span> <span style={referenceStyle}>{reference}</span>
              </Text>
              {notes && (
                <Text style={detailItem}>
                  <span style={label}>Notes:</span> {notes}
                </Text>
              )}
            </Section>

            {/* Action Required */}
            <Section style={actionSection}>
              <Heading style={h3}>Action Required:</Heading>
              <Text style={actionText}>
                Please confirm this booking and follow up with the customer for any additional details.
              </Text>
            </Section>

            {/* Footer Note */}
            <Text style={footerNote}>
              This notification was sent automatically from your Lashed by Deedee booking system.
            </Text>
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
  padding: "32px 24px",
  textAlign: "center" as const,
}

const h1 = {
  color: "#2c3e50",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 16px",
  textAlign: "center" as const,
}

const headerDivider = {
  borderColor: "#ec4899",
  borderWidth: "2px",
  margin: "16px 0 0 0",
}

const content = {
  padding: "0 24px 32px",
}

const h2 = {
  color: "#2c3e50",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
}

const h3 = {
  color: "#2c3e50",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
}

const customerSection = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
}

const bookingSection = {
  backgroundColor: "#e3f2fd",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
}

const actionSection = {
  backgroundColor: "#fff3cd",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
  border: "1px solid #ffeaa7",
}

const detailItem = {
  color: "#2c3e50",
  fontSize: "16px",
  margin: "8px 0",
}

const label = {
  fontWeight: "600",
  color: "#2c3e50",
}

const linkStyle = {
  color: "#3498db",
  textDecoration: "none",
}

const referenceStyle = {
  fontFamily: "monospace",
  backgroundColor: "#e8f5e8",
  padding: "2px 6px",
  borderRadius: "4px",
  color: "#059669",
  fontWeight: "600",
}

const actionText = {
  color: "#856404",
  fontSize: "16px",
  margin: "0",
}

const footerNote = {
  color: "#6b7280",
  fontSize: "14px",
  fontStyle: "italic",
  textAlign: "center" as const,
  margin: "32px 0 0",
}

export default AdminBookingNotificationEmail
