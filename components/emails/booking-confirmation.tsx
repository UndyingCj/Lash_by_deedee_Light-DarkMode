import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface BookingConfirmationEmailProps {
  customerName: string
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
          <Heading style={h1}>Booking Confirmed!</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>Thank you for booking with Lashed by Deedee! Your appointment has been confirmed.</Text>

          <Section style={section}>
            <Heading style={h2}>Booking Details</Heading>
            <Text style={text}>
              <strong>Services:</strong> {services.join(", ")}
            </Text>
            <Text style={text}>
              <strong>Date:</strong> {bookingDate}
            </Text>
            <Text style={text}>
              <strong>Time:</strong> {bookingTime}
            </Text>
            <Text style={text}>
              <strong>Total Amount:</strong> ₦{totalAmount.toLocaleString()}
            </Text>
            <Text style={text}>
              <strong>Deposit Paid:</strong> ₦{depositAmount.toLocaleString()}
            </Text>
            <Text style={text}>
              <strong>Payment Reference:</strong> {paymentReference}
            </Text>
          </Section>

          <Text style={text}>
            We look forward to seeing you! If you need to reschedule or have any questions, please contact us as soon as
            possible.
          </Text>

          <Text style={text}>
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
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#000",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0 10px",
  padding: "0",
}

const text = {
  color: "#000",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "14px",
  lineHeight: "26px",
  textAlign: "left" as const,
  margin: "16px 40px",
}

const section = {
  padding: "20px 40px",
}

export default BookingConfirmationEmail
