export async function sendBookingConfirmationEmail({
  customerName,
  customerEmail,
  services,
  date,
  time,
  totalAmount,
  depositAmount,
  paymentReference,
}: {
  customerName: string
  customerEmail: string
  services: string[]
  date: string
  time: string
  totalAmount: number
  depositAmount: number
  paymentReference?: string
}) {
  try {
    const emailHtml = await render(
      BookingConfirmationEmail({
        customerName,
        services,
        date,
        time,
        totalAmount,
        depositAmount,
        paymentReference,
      }),
    )

    const { data, error } = await resend.emails.send({
      from: "Lashed by Deedee <bookings@lashedbydeedee.com>",
      to: [customerEmail],
      subject: `Booking Confirmed - ${new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })} at ${time}`,
      html: emailHtml,
    })

    if (error) {
      console.error("Failed to send confirmation email:", error)
      throw new Error(`Email sending failed: ${error.message}`)
    }

    console.log("Confirmation email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    throw error
  }
}
