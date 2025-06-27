import { Html, Head, Body, Container, Text, Section } from "@react-email/components"

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
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section style={{ textAlign: "center", marginBottom: "30px" }}>
            <Text style={{ color: "#ec4899", fontSize: "24px", fontWeight: "bold", margin: "0" }}>
              Lashed by Deedee
            </Text>
            <Text style={{ color: "#666", margin: "5px 0" }}>Beauty & Lash Studio</Text>
          </Section>

          <Section style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
            <Text style={{ color: "#1f2937", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
              Booking Confirmed! ✨
            </Text>
            <Text style={{ color: "#4b5563", marginBottom: "30px" }}>
              Hi {customerName}, your booking has been confirmed. Here are the details:
            </Text>

            <Section style={{ backgroundColor: "#f9fafb", padding: "20px", borderRadius: "6px", margin: "20px 0" }}>
              <Text style={{ color: "#6b7280", fontWeight: "bold", margin: "8px 0" }}>Service(s):</Text>
              <Text style={{ color: "#1f2937", margin: "8px 0" }}>{services.join(", ")}</Text>

              <Text style={{ color: "#6b7280", fontWeight: "bold", margin: "8px 0" }}>Date:</Text>
              <Text style={{ color: "#1f2937", margin: "8px 0" }}>{date}</Text>

              <Text style={{ color: "#6b7280", fontWeight: "bold", margin: "8px 0" }}>Time:</Text>
              <Text style={{ color: "#1f2937", margin: "8px 0" }}>{time}</Text>

              <Text style={{ color: "#6b7280", fontWeight: "bold", margin: "8px 0" }}>Amount Paid:</Text>
              <Text style={{ color: "#1f2937", margin: "8px 0" }}>₦{depositAmount.toLocaleString()}</Text>

              <Text style={{ color: "#6b7280", fontWeight: "bold", margin: "8px 0" }}>Payment Reference:</Text>
              <Text style={{ color: "#1f2937", fontFamily: "monospace", margin: "8px 0" }}>{paymentReference}</Text>
            </Section>

            <Section
              style={{
                backgroundColor: "#fef3c7",
                padding: "15px",
                borderRadius: "6px",
                margin: "20px 0",
              }}
            >
              <Text style={{ color: "#92400e", margin: "0", fontSize: "14px" }}>
                <strong>Important:</strong> Please arrive 10 minutes before your appointment time. If you need to
                reschedule, please contact us at least 24 hours in advance.
              </Text>
            </Section>

            <Section style={{ textAlign: "center", margin: "30px 0" }}>
              <Text style={{ color: "#4b5563", marginBottom: "15px" }}>Questions? Contact us:</Text>
              <Text style={{ color: "#ec4899", fontWeight: "bold", margin: "5px 0" }}>
                📧 lashedbydeedeee@gmail.com
              </Text>
              <Text style={{ color: "#ec4899", fontWeight: "bold", margin: "5px 0" }}>
                📱 WhatsApp: +234 XXX XXX XXXX
              </Text>
            </Section>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "30px" }}>
            <Text style={{ color: "#9ca3af", fontSize: "12px" }}>Thank you for choosing Lashed by Deedee! ✨</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
