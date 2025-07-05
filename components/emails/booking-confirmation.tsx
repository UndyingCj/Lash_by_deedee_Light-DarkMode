import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface BookingConfirmationEmailProps {
  clientName: string
  service: string
  date: string
  time: string
  amount: number
}

export default function BookingConfirmationEmail({
  clientName,
  service,
  date,
  time,
  amount,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your booking with Lashed by Deedee has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed! 💕</Heading>

          <Text style={text}>Hi {clientName},</Text>

          <Text style={text}>Thank you for booking with Lashed by Deedee! Your appointment has been confirmed.</Text>

          <Section style={bookingDetails}>
            <Heading style={h2}>Booking Details</Heading>
            <Text style={detail}>
              <strong>Service:</strong> {service}
            </Text>
            <Text style={detail}>
              <strong>Date:</strong> {date}
            </Text>
            <Text style={detail}>
              <strong>Time:</strong> {time}
            </Text>
            <Text style={detail}>
              <strong>Amount Paid:</strong> ₦{amount.toLocaleString()}
            </Text>
          </Section>

          <Text style={text}>We're excited to see you! Please arrive 5-10 minutes early for your appointment.</Text>

          <Text style={text}>
            If you need to reschedule or have any questions, please contact us at least 24 hours in advance.
          </Text>

          <Text style={footer}>
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
  maxWidth: "360px",
  margin: "0 auto",
  padding: "68px 0 130px",
}

const h1 = {
  color: "#000",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#000",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0 10px",
  padding: "0",
}

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 8px 8px 8px",
  textAlign: "left" as const,
}

const bookingDetails = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #eee",
  borderRadius: "5px",
  margin: "16px 8px",
  padding: "16px",
}

const detail = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
}

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "16px 8px 8px 8px",
  textAlign: "left" as const,
}
