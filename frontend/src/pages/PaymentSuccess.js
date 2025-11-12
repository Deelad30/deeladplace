import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");
      if (!reference) return;

      try {

        const response = await axios.get(`http://localhost:5000/api/paystack/verify/${reference}`);

        if (response.data.status === "success") {

          navigate("/dashboard");
        } else {
          alert("Payment verification failed.");
          navigate("/checkout"); // fallback
        }
      } catch (error) {
        console.error("Verification error:", error);
        alert("Error verifying payment.");
        navigate("/checkout");
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div style={{
      textAlign: "center",
      paddingTop: "80px",
      fontSize: "18px",
      color: "#555",
    }}>
     <ClipLoader color="#007bff" size={60} />
      <h2>Verifying your payment...</h2>
      <p>Please wait a moment while we confirm your transaction.</p>
    </div>
  );
}

export default PaymentSuccess;
