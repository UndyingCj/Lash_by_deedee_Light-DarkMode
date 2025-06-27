import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface BookingConfirmationProps {
  customerName: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
}

export function BookingConfirmation({
  customerName,
  services,
  date,
  time,
  totalAmount,
  depositAmount,
  paymentReference,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your booking is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed! 💅</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>Your booking has been confirmed! Here are your appointment details:</Text>

          <Section style={detailsContainer}>
            <Text style={detailsTitle}>Services:</Text>
            {services.map((service, index) => (
              <Text key={index} style={detailsText}>
                • {service}
              </Text>
            ))}

            <Text style={detailsTitle}>Date & Time:</Text>
            <Text style={detailsText}>
              {new Date(date).toLocaleDateString()} at {time}
            </Text>

            <Text style={detailsTitle}>Payment Details:</Text>
            <Text style={detailsText}>Total: ₦{totalAmount.toLocaleString()}</Text>
            <Text style={detailsText}>Deposit Paid: ₦{depositAmount.toLocaleString()}</Text>
            <Text style={detailsText}>Balance Due: ₦{(totalAmount - depositAmount).toLocaleString()}</Text>
            <Text style={detailsText}>Reference: {paymentReference}</Text>
          </Section>

          <Text style={text}>
            Please arrive 15 minutes early for your appointment. If you need to reschedule, please contact us at least
            24 hours in advance.
          </Text>

          <Text style={text}>
            Looking forward to seeing you!
            <br />
            Lashed by Deedee Team
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

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
}

const detailsContainer = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
}

const detailsTitle = {
  color: "#ec4899",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "16px 0 8px 0",
}

const detailsText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
}
