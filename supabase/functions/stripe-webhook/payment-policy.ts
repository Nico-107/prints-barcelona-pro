export function isSuccessfulCheckout(eventType: string, paymentStatus: string | undefined): boolean {
  return (eventType === "checkout.session.completed" || eventType === "checkout.session.async_payment_succeeded") && paymentStatus === "paid";
}