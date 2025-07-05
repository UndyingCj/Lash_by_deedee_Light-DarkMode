import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface BookingConfirmationEmailProps {
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
      <Preview>Your booking with Lashed by Deedee has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed! 💅</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>Thank you for your payment! Your booking with Lashed by Deedee has been confirmed.</Text>

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

            <Hr style={hr} />

            <Text style={detailItem}>
              <strong>Total Service Cost:</strong> ₦{totalAmount.toLocaleString()}
            </Text>

            <Text style={detailItem}>
              <strong>Deposit Paid:</strong> ₦{depositAmount.toLocaleString()}
            </Text>

            <Text style={detailItem}>
              <strong>Balance Due:</strong> ₦{(totalAmount - depositAmount).toLocaleString()}
            </Text>

            <Text style={detailItem}>
              <strong>Payment Reference:</strong> {paymentReference}
            </Text>
          </Section>

          <Section style={importantInfo}>
            <Heading style={h3}>Important Reminders</Heading>
            <Text style={text}>
              • Please arrive on time for your appointment
              <br />• Avoid wearing makeup to ensure the best results
              <br />• The remaining balance is due on the day of service
              <br />• Contact us if you need to reschedule (24 hours notice required)
            </Text>
          </Section>

          <Text style={text}>We're excited to see you soon!</Text>

          <Text style={signature}>
            Best regards,
            <br />
            Deedee & Team
            <br />
            Lashed by Deedee
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

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "30px 0 15px",
}

const h3 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "25px 0 10px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
}

const bookingDetails = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const importantInfo = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
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

const hr = {
  borderColor: "#e9ecef",
  margin: "15px 0",
}

const signature = {
  color: "#666",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "30px 0 0",
}
