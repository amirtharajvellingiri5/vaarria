import axios from "axios";

const API_BASE =
  "https://d8obcfi1ua.execute-api.ap-south-1.amazonaws.com/prod";

function RazorpayPayment() {
  const payNow = async () => {
    try {
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      const { data } = await axios.post(`${API_BASE}/payments/create-order`, {
        amount: 500,
        receipt: `receipt_${Date.now()}`
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: "My Store",
        description: "Order Payment",

        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999"
        },

        handler: async (response) => {
          await axios.post(`${API_BASE}/payments/verify`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          alert("Payment successful");
        },

        modal: {
          ondismiss: () => console.log("Payment cancelled")
        }
      };

      new window.Razorpay(options).open();

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    }
  };

  return <button onClick={payNow}>Pay ₹500</button>;
}

export default RazorpayPayment;