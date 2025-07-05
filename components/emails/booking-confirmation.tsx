import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface BookingConfirmationEmailProps {
  customerName: string
  customerEmail: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference: string
  isReminder?: boolean
}

export default function BookingConfirmationEmail({
  customerName,
  customerEmail,
  services,
  bookingDate,
  bookingTime,
  totalAmount,
  depositAmount,
  paymentReference,
  isReminder = false,
}: BookingConfirmationEmailProps) {
  const formattedDate = new Date(bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const remainingBalance = totalAmount - depositAmount

  return (
    <Html>
      <Head />
      <Preview>
        {isReminder
          ? `Reminder: Your appointment with Lashed by Deedee is tomorrow!`
          : `Your booking with Lashed by Deedee has been confirmed!`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://lashedbydeedee.com/placeholder-logo.png"
              width="120"
              height="60"
              alt="Lashed by Deedee"
              style={logo}
            />
          </Section>

          <Heading style={h1}>{isReminder ? "Appointment Reminder" : "Booking Confirmed!"}</Heading>

          <Text style={text}>Hi {customerName},</Text>

          <Text style={text}>
            {isReminder
              ? `This is a friendly reminder that your appointment with Lashed by Deedee is scheduled for tomorrow!`
              : `Thank you for booking with Lashed by Deedee! Your appointment has been confirmed and we can't wait to see you.`}
          </Text>

          <Section style={bookingDetails}>
            <Heading style={h2}>Booking Details</Heading>

            <Text style={detailItem}>
              <strong>Services:</strong> {services.join(", ")}
            </Text>

            <Text style={detailItem}>
              <strong>Date:</strong> {formattedDate}
            </Text>

            <Text style={detailItem}>
              <strong>Time:</strong> {bookingTime}
            </Text>

            <Text style={detailItem}>
              <strong>Total Service Cost:</strong> ₦{totalAmount.toLocaleString()}
            </Text>

            <Text style={detailItem}>
              <strong>Deposit Paid:</strong> ₦{depositAmount.toLocaleString()}
            </Text>

            {remainingBalance > 0 && (
              <Text style={detailItem}>
                <strong>Remaining Balance:</strong> ₦{remainingBalance.toLocaleString()} (to be paid at appointment)
              </Text>
            )}

            <Text style={detailItem}>
              <strong>Payment Reference:</strong> {paymentReference}
            </Text>
          </Section>

          {!isReminder && (
            <Section style={importantInfo}>
              <Heading style={h3}>Important Information</Heading>
              <Text style={text}>• Please arrive 10 minutes before your scheduled appointment time</Text>
              <Text style={text}>• If you need to reschedule, please contact us at least 24 hours in advance</Text>
              <Text style={text}>• Bring a valid ID and your payment reference number</Text>
              <Text style={text}>• Avoid caffeine before your lash appointment for best results</Text>
            </Section>
          )}

          <Section style={contactInfo}>
            <Heading style={h3}>Contact Information</Heading>
            <Text style={text}>
              <strong>Phone:</strong> +234 (0) 123 456 7890
            </Text>
            <Text style={text}>
              <strong>Email:</strong> hello@lashedbydeedee.com
            </Text>
            <Text style={text}>
              <strong>Instagram:</strong>{" "}
              <Link href="https://instagram.com/lashedbydeedee" style={link}>
                @lashedbydeedee
              </Link>
            </Text>
          </Section>

          <Text style={footer}>
            Thank you for choosing Lashed by Deedee!
            <br />
            We look forward to making you look and feel amazing.
          </Text>

          <Text style={disclaimer}>
            This email was sent to {customerEmail}. If you have any questions about your booking, please contact us
            directly.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
}

const logoContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
}

const logo = {
  margin: "0 auto",
}

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "24px 0 16px",
}

const h3 = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "24px 0 12px",
}

const text = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
}

const bookingDetails = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
}

const detailItem = {
  color: "#484848",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0",
}

const importantInfo = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
}

const contactInfo = {
  backgroundColor: "#e3f2fd",
  border: "1px solid #bbdefb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
}

const link = {
  color: "#0066cc",
  textDecoration: "underline",
}

const footer = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "32px 0",
  fontWeight: "bold",
}

const disclaimer = {
  color: "#9ca299",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
  margin: "24px 0",
}
