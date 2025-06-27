import { Html, Head, Body, Container, Text, Section, Hr } from "@react-email/components"

interface BookingConfirmationProps {
  customerName: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export default function BookingConfirmationEmail({
  customerName,
  services,
  date,
  time,
  totalAmount,
  depositAmount,
  paymentReference,
}: BookingConfirmationProps) {
  const formattedDate = new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const remainingBalance = totalAmount - depositAmount

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>Lashed by Deedee</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Booking Confirmed! 🎉</Text>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Thank you for booking with Lashed by Deedee! Your appointment has been confirmed and your deposit has been
              received.
            </Text>

            <Section style={detailsContainer}>
              <Text style={detailsHeading}>Appointment Details</Text>

              <Section style={detailRow}>
                <Text style={detailLabel}>Services:</Text>
                <Text style={detailValue}>{services.join(", ")}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Date:</Text>
                <Text style={detailValue}>{formattedDate}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Time:</Text>
                <Text style={detailValue}>{time}</Text>
              </Section>

              <Hr style={detailHr} />

              <Section style={detailRow}>
                <Text style={detailLabel}>Total Service Cost:</Text>
                <Text style={detailValue}>₦{totalAmount.toLocaleString()}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Deposit Paid:</Text>
                <Text style={detailValue}>₦{depositAmount.toLocaleString()}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Remaining Balance:</Text>
                <Text style={[detailValue, remainingAmount]}>₦{remainingBalance.toLocaleString()}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Payment Reference:</Text>
                <Text style={[detailValue, referenceText]}>{paymentReference}</Text>
              </Section>
            </Section>

            <Text style={text}>
              <strong>Important Reminders:</strong>
            </Text>
            <Text style={listItem}>• Please arrive 10 minutes before your appointment time</Text>
            <Text style={listItem}>
              • The remaining balance of ₦{remainingBalance.toLocaleString()} is due at your appointment
            </Text>
            <Text style={listItem}>• If you need to reschedule, please contact us at least 24 hours in advance</Text>
            <Text style={listItem}>• Bring a valid ID and your payment reference number</Text>

            <Text style={text}>We're excited to see you and help you achieve your beauty goals!</Text>

            <Section style={contactInfo}>
              <Text style={contactHeading}>Contact Information</Text>
              <Text style={contactText}>📍 Port Harcourt, Nigeria</Text>
              <Text style={contactText}>📧 lashedbydeedeee@gmail.com</Text>
              <Text style={contactText}>📱 WhatsApp: +234 XXX XXX XXXX</Text>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>© 2024 Lashed by Deedee. All rights reserved.</Text>
            <Text style={footerText}>Where Beauty Meets Precision</Text>
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
  backgroundColor: "#ec4899",
}

const title = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
}

const content = {
  padding: "24px",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1f2937",
  margin: "0 0 16px",
}

const text = {
  fontSize: "16px",
  color: "#374151",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const detailsContainer = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
}

const detailsHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1f2937",
  margin: "0 0 16px",
}

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "8px 0",
}

const detailLabel = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
  width: "50%",
}

const detailValue = {
  fontSize: "14px",
  color: "#1f2937",
  fontWeight: "500",
  margin: "0",
  textAlign: "right" as const,
  width: "50%",
}

const remainingAmount = {
  color: "#dc2626",
  fontWeight: "bold",
}

const referenceText = {
  fontFamily: "monospace",
  fontSize: "12px",
}

const detailHr = {
  borderColor: "#e5e7eb",
  margin: "12px 0",
}

const listItem = {
  fontSize: "14px",
  color: "#374151",
  margin: "4px 0",
  paddingLeft: "8px",
}

const contactInfo = {
  backgroundColor: "#fef3f2",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
}

const contactHeading = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1f2937",
  margin: "0 0 8px",
}

const contactText = {
  fontSize: "14px",
  color: "#374151",
  margin: "4px 0",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
}

const footer = {
  padding: "0 24px",
}

const footerText = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: "4px 0",
}
