import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface BookingConfirmationEmailProps {
  customerName: string
  customerEmail: string
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
  const balanceDue = totalAmount - depositAmount

  return (
    <Html>
      <Head />
      <Preview>Your booking with Lashed by Deedee has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed! 💕</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>
            Thank you for booking with Lashed by Deedee! Your appointment has been confirmed and your deposit has been
            received.
          </Text>

          <Section style={bookingDetails}>
            <Heading style={h2}>Booking Details</Heading>
            <Text style={detail}>
              <strong>Services:</strong> {services.join(", ")}
            </Text>
            <Text style={detail}>
              <strong>Date:</strong>{" "}
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={detail}>
              <strong>Time:</strong> {time}
            </Text>
            <Text style={detail}>
              <strong>Total Service Cost:</strong> ₦{totalAmount.toLocaleString()}
            </Text>
            <Text style={detail}>
              <strong>Deposit Paid:</strong> ₦{depositAmount.toLocaleString()}
            </Text>
            <Text style={detail}>
              <strong>Balance Due at Appointment:</strong> ₦{balanceDue.toLocaleString()}
            </Text>
            <Text style={detail}>
              <strong>Payment Reference:</strong> {paymentReference}
            </Text>
          </Section>

          <Section style={importantInfo}>
            <Heading style={h3}>Important Information</Heading>
            <Text style={text}>• Please arrive 10 minutes before your appointment time</Text>
            <Text style={text}>• Bring the remaining balance of ₦{balanceDue.toLocaleString()} in cash</Text>
            <Text style={text}>• If you need to reschedule, please contact us at least 24 hours in advance</Text>
          </Section>

          <Text style={text}>We're excited to see you soon! If you have any questions, feel free to reach out.</Text>

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
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
}

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
  marginTop: "20px",
  maxWidth: "600px",
  padding: "68px 0 130px",
}

const h1 = {
  color: "#333",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "28px",
  fontWeight: "500",
  lineHeight: "1.3",
  margin: "30px 0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#333",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "20px",
  fontWeight: "500",
  lineHeight: "1.3",
  margin: "20px 0 10px",
}

const h3 = {
  color: "#333",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "16px",
  fontWeight: "500",
  lineHeight: "1.3",
  margin: "20px 0 10px",
}

const text = {
  color: "#333",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "16px 0",
  padding: "0 40px",
}

const bookingDetails = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #eee",
  borderRadius: "5px",
  margin: "20px 40px",
  padding: "20px",
}

const importantInfo = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "5px",
  margin: "20px 40px",
  padding: "20px",
}

const detail = {
  color: "#333",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "8px 0",
}

const signature = {
  color: "#333",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "30px 0 16px",
  padding: "0 40px",
}
