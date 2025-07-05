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
          <Heading style={h1}>Booking Confirmed! ✨</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>
            Thank you for booking with Lashed by Deedee! Your appointment has been confirmed and your deposit has been
            processed.
          </Text>

          <Section style={bookingDetails}>
            <Heading style={h2}>Booking Details</Heading>
            <Text style={detailText}>
              <strong>Services:</strong> {services.join(", ")}
            </Text>
            <Text style={detailText}>
              <strong>Date:</strong> {formattedDate}
            </Text>
            <Text style={detailText}>
              <strong>Time:</strong> {time}
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
              <strong>Payment Reference:</strong> {paymentReference}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Heading style={h2}>Important Reminders</Heading>
            <Text style={text}>• Please arrive on time for your appointment</Text>
            <Text style={text}>• Avoid wearing makeup to ensure the best results</Text>
            <Text style={text}>• The remaining balance is due at your appointment</Text>
            <Text style={text}>• Contact us if you need to reschedule (24 hours notice required)</Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions, please don't hesitate to contact us via WhatsApp or email.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The Lashed by Deedee Team
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

const text = {
  color: "#333",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "16px 68px",
}

const detailText = {
  color: "#333",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "8px 68px",
}

const bookingDetails = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #eee",
  borderRadius: "5px",
  margin: "20px 68px",
  padding: "20px",
}

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
}

const footer = {
  color: "#8898aa",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  fontSize: "12px",
  lineHeight: "1.4",
  margin: "16px 68px",
}
