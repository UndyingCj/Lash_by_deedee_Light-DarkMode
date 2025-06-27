import { Html, Head, Body, Container, Text, Section } from "@react-email/components"

interface BookingConfirmationProps {
  bookingId: string
  clientName: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  totalAmount: number
  depositAmount: number
}

export function BookingConfirmationEmail({
  bookingId,
  clientName,
  serviceName,
  appointmentDate,
  appointmentTime,
  totalAmount,
  depositAmount,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section style={{ backgroundColor: "white", padding: "40px", borderRadius: "8px" }}>
            <Text
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Lashed by Deedee
            </Text>
            <Text style={{ fontSize: "18px", color: "#374151", marginBottom: "30px", textAlign: "center" }}>
              Booking Confirmed! 🎉
            </Text>
            <Text style={{ fontSize: "16px", color: "#6b7280", marginBottom: "20px" }}>Hi {clientName},</Text>
            <Text style={{ fontSize: "16px", color: "#6b7280", marginBottom: "30px" }}>
              Your booking has been confirmed! Here are the details:
            </Text>

            <Section style={{ backgroundColor: "#fdf2f8", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
              <Text style={{ fontSize: "14px", color: "#374151", margin: "5px 0" }}>
                <strong>Booking ID:</strong> {bookingId}
              </Text>
              <Text style={{ fontSize: "14px", color: "#374151", margin: "5px 0" }}>
                <strong>Service:</strong> {serviceName}
              </Text>
              <Text style={{ fontSize: "14px", color: "#374151", margin: "5px 0" }}>
                <strong>Date:</strong> {appointmentDate}
              </Text>
              <Text style={{ fontSize: "14px", color: "#374151", margin: "5px 0" }}>
                <strong>Time:</strong> {appointmentTime}
              </Text>
              <Text style={{ fontSize: "14px", color: "#374151", margin: "5px 0" }}>
                <strong>Total Amount:</strong> ₦{totalAmount.toLocaleString()}
              </Text>
              <Text style={{ fontSize: "14px", color: "#374151", margin: "5px 0" }}>
                <strong>Deposit Paid:</strong> ₦{depositAmount.toLocaleString()}
              </Text>
            </Section>

            <Text style={{ fontSize: "16px", color: "#6b7280", marginBottom: "20px" }}>
              We're excited to see you! Please arrive 10 minutes early for your appointment.
            </Text>
            <Text style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              If you need to reschedule or have any questions, please contact us at lashedbydeedeee@gmail.com
            </Text>
            <Text style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
              © 2024 Lashed by Deedee. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
