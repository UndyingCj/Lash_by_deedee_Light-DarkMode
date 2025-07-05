import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface BookingConfirmationEmailProps {
  customerName: string
  customerEmail: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export function BookingConfirmationEmail({
  customerName,
  services,
  bookingDate,
  bookingTime,
  totalAmount,
  depositAmount,
  paymentReference,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your booking with Lashed by Deedee has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed! ✨</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>
            Thank you for booking with Lashed by Deedee! Your appointment has been confirmed and we can't wait to see
            you.
          </Text>

          <Section style={bookingDetails}>
            <Heading style={h2}>Booking Details</Heading>

            <Text style={detailText}>
              <strong>Services:</strong> {services.join(", ")}
            </Text>

            <Text style={detailText}>
              <strong>Date:</strong> {bookingDate}
            </Text>

            <Text style={detailText}>
              <strong>Time:</strong> {bookingTime}
            </Text>

            <Text style={detailText}>
              <strong>Total Amount:</strong> ₦{totalAmount.toLocaleString()}
            </Text>

            <Text style={detailText}>
              <strong>Deposit Paid:</strong> ₦{depositAmount.toLocaleString()}
            </Text>

            <Text style={detailText}>
              <strong>Payment Reference:</strong> {paymentReference}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Heading style={h2}>What to Expect</Heading>
            <Text style={text}>• Please arrive 10 minutes before your appointment time</Text>
            <Text style={text}>• Come with clean lashes (no makeup or mascara)</Text>
            <Text style={text}>• Bring a valid ID for verification</Text>
            <Text style={text}>• The remaining balance will be collected at the appointment</Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            If you need to reschedule or have any questions, please contact us at least 24 hours before your
            appointment.
          </Text>

          <Text style={text}>Looking forward to enhancing your natural beauty!</Text>

          <Text style={signature}>
            Best regards,
            <br />
            Deedee
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
  fontSize: "18px",
  fontWeight: "bold",
  margin: "30px 0 15px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
}

const detailText = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
}

const bookingDetails = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const signature = {
  color: "#666",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
}

export default BookingConfirmationEmail
