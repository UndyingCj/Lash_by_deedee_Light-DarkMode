import { Html, Head, Body, Container, Section, Heading, Text, Hr, Row, Column } from "@react-email/components"

interface BookingConfirmationEmailProps {
  customerName: string
  services: string[]
  bookingDate: string
  bookingTime: string
  totalAmount: number
  depositAmount: number
  paymentReference?: string
}

export default function BookingConfirmationEmail({
  customerName,
  services,
  bookingDate,
  bookingTime,
  totalAmount,
  depositAmount,
  paymentReference,
}: BookingConfirmationEmailProps) {
  const balanceAmount = totalAmount - depositAmount

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f3f4f6" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff" }}>
          {/* Header */}
          <Section
            style={{
              background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
              padding: "30px",
              textAlign: "center",
            }}
          >
            <Heading style={{ color: "#ffffff", margin: "0", fontSize: "28px" }}>Booking Confirmed!</Heading>
            <Text style={{ color: "rgba(255,255,255,0.9)", margin: "10px 0 0 0" }}>
              Thank you for choosing Lashed by Deedee
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={{ padding: "30px" }}>
            <Heading style={{ color: "#1f2937", marginBottom: "20px", fontSize: "24px" }}>
              Hello {customerName},
            </Heading>

            <Text style={{ color: "#4b5563", lineHeight: "1.6", marginBottom: "25px" }}>
              Your booking has been confirmed! We're excited to see you and provide you with our premium beauty
              services.
            </Text>

            {/* Booking Details */}
            <Section
              style={{
                backgroundColor: "#fdf2f8",
                padding: "25px",
                borderRadius: "8px",
                margin: "25px 0",
              }}
            >
              <Heading style={{ color: "#be185d", marginTop: "0", marginBottom: "15px", fontSize: "18px" }}>
                Booking Details
              </Heading>

              <Row>
                <Column style={{ width: "30%", padding: "8px 0", color: "#6b7280", fontWeight: "500" }}>
                  Services:
                </Column>
                <Column style={{ width: "70%", padding: "8px 0", color: "#1f2937" }}>{services.join(", ")}</Column>
              </Row>

              <Row>
                <Column style={{ width: "30%", padding: "8px 0", color: "#6b7280", fontWeight: "500" }}>Date:</Column>
                <Column style={{ width: "70%", padding: "8px 0", color: "#1f2937" }}>
                  {new Date(bookingDate + "T12:00:00Z").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Column>
              </Row>

              <Row>
                <Column style={{ width: "30%", padding: "8px 0", color: "#6b7280", fontWeight: "500" }}>Time:</Column>
                <Column style={{ width: "70%", padding: "8px 0", color: "#1f2937" }}>{bookingTime}</Column>
              </Row>

              <Row>
                <Column style={{ width: "30%", padding: "8px 0", color: "#6b7280", fontWeight: "500" }}>
                  Total Amount:
                </Column>
                <Column style={{ width: "70%", padding: "8px 0", color: "#1f2937" }}>
                  ₦{totalAmount.toLocaleString()}
                </Column>
              </Row>

              <Row>
                <Column style={{ width: "30%", padding: "8px 0", color: "#6b7280", fontWeight: "500" }}>
                  Deposit Paid:
                </Column>
                <Column style={{ width: "70%", padding: "8px 0", color: "#059669", fontWeight: "600" }}>
                  ₦{depositAmount.toLocaleString()}
                </Column>
              </Row>

              <Row>
                <Column style={{ width: "30%", padding: "8px 0", color: "#6b7280", fontWeight: "500" }}>
                  Balance Due:
                </Column>
                <Column style={{ width: "70%", padding: "8px 0", color: "#dc2626" }}>
                  ₦{balanceAmount.toLocaleString()}
                </Column>
              </Row>

              {paymentReference && (
                <Row>
                  <Column style={{ width: "30%", padding: "8px 0", color: "#6b7280", fontWeight: "500" }}>
                    Reference:
                  </Column>
                  <Column
                    style={{
                      width: "70%",
                      padding: "8px 0",
                      color: "#1f2937",
                      fontFamily: "monospace",
                      fontSize: "14px",
                    }}
                  >
                    {paymentReference}
                  </Column>
                </Row>
              )}
            </Section>

            {/* Important Reminders */}
            <Section
              style={{
                backgroundColor: "#fef3c7",
                borderLeft: "4px solid #f59e0b",
                padding: "20px",
                margin: "25px 0",
              }}
            >
              <Heading style={{ color: "#92400e", margin: "0 0 10px 0", fontSize: "16px" }}>
                Important Reminders:
              </Heading>
              <Text style={{ color: "#78350f", margin: "0" }}>
                • Please arrive 10 minutes before your appointment
                <br />• The remaining balance of ₦{balanceAmount.toLocaleString()} is due at your appointment
                <br />• Cancellations must be made at least 24 hours in advance
                <br />• Late arrivals may result in shortened service time
              </Text>
            </Section>

            <Text style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.5" }}>
              If you have any questions or need to reschedule, please don't hesitate to contact us. We look forward to
              providing you with an amazing beauty experience!
            </Text>
          </Section>

          <Hr />

          {/* Footer */}
          <Section
            style={{
              backgroundColor: "#f9fafb",
              padding: "20px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "12px",
            }}
          >
            <Text style={{ margin: "0" }}>© 2025 Lashed by Deedee. All rights reserved.</Text>
            <Text style={{ margin: "5px 0 0 0" }}>
              This is an automated message, please do not reply directly to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Named export for compatibility
export { BookingConfirmationEmail }
