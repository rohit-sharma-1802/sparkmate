import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import playstoreicon from "../../images/playstore-icon.png";
import appleicon from "../../images/apple-icon.png";

import { Hearts } from "react-loader-spinner";

const AuthModal = ({ setShowModal, isSignUp }) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [error, setError] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(null);

  const [sendOTP, setSendOTP] = useState(true);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpValue, setOTPValue] = useState("");
  const [otpLoader, setOtpLoader] = useState(false);
  const [verifyOTPLoader, setVerifyOTPLoader] = useState(false);

  let navigate = useNavigate();

  const handleClick = () => {
    setShowModal(false);
  };

  const otpVerifier = async (e) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords need to match!");
      return;
    }
    if (isSignUp && password.length < 8) {
      setError(
        "Invalid password. Password must contain at least 8 characters, including one letter, one number, and one special character."
      );
      return;
    }

    if (
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*()_+]/.test(password)
    ) {
      setError(
        "Invalid password. Password must contain at least 8 characters, including one letter, one number, and one special character."
      );
      return;
    }
    setError("");
    setOtpLoader(true);
  
    try {
      const response = await axios.post(`http://localhost:8000/signup`, {
        email,
        password,
      });
  
      const success = response.status === 201;
      if (success && isSignUp) {
        setPassword("");
        setOTPValue("");
        setSendOTP(false);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Account already exists");
    } finally {
      setOtpLoader(false);
    }
  };
  
  const checkOTP = async (e) => {
    e.preventDefault();
    setVerifyOTPLoader(true);
  
    try {
      const verifyOTP = await axios.post(`http://localhost:8000/verifyUser`, {
        email,
        otpValue,
      });
  
      const success = verifyOTP.status === 200;
      if (success && isSignUp) {
        setCookie("AuthToken", verifyOTP.data.token);
        setCookie("UserId", verifyOTP.data.userId);
        navigate("/onboarding");
      } else {
        setError("Invalid OTP. Please enter a valid OTP and try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setVerifyOTPLoader(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp && password !== confirmPassword) {
        setError("Passwords need to match!");
        return;
      }
      if (isSignUp && password.length < 8) {
        setError(
          "Invalid password. Password must contain at least 8 characters, including one letter, one number, and one special character."
        );
        return;
      }

      if (
        !/[a-zA-Z]/.test(password) ||
        !/\d/.test(password) ||
        !/[!@#$%^&*()_+]/.test(password)
      ) {
        setError(
          "Invalid password. Password must contain at least 8 characters, including one letter, one number, and one special character."
        );
        return;
      }

      //   const response = await axios.post(
      //     `http://localhost:8000/verifyUser`, {email, password}
      //   );

      const response = await axios.post(
        `http://localhost:8000/${isSignUp ? "signup" : "login"}`,
        { email, password }
      );
  
      setCookie("AuthToken", response.data.token);
      setCookie("UserId", response.data.userId);
  
      const success = response.status === 201;
      if (success && isSignUp) navigate("/onboarding");
      if (success && !isSignUp) navigate("/dashboard");
  
      window.location.reload();
    } catch (error) {
      console.error("Error logging in or signing up:", error);
  
      if (error.response && error.response.status === 400) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="auth-modal">
      <div className="close-icon" onClick={handleClick}>
        ⓧ
      </div>

      <h2>{isSignUp ? "CREATE ACCOUNT" : "LOG IN"}</h2>
      <p>By clicking Log In, you agree to our terms and conditions.</p>

      {/* signupModal */}
      {isSignUp && sendOTP ? (
        <form onSubmit={otpVerifier}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="email"
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            id="password"
            name="password"
            placeholder="password"
            required={true}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignUp && sendOTP && (
            <input
              type="password"
              id="password-check"
              name="password-check"
              placeholder="confirm password"
              required={true}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          <button className="secondary-button" type="submit">
            {otpLoader ? (
              "SENDING OTP..."
            ) : (
              "SEND OTP"
            )}
          </button>
          <p>{error}</p>
        </form>
      ) : isSignUp && !sendOTP ? (
        <form onSubmit={checkOTP}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="email"
            required={true}
            disabled
          />
          <input
            type="text"
            id="otpValue"
            name="otpValue"
            placeholder="Enter OTP"
            required={true}
            value={otpValue}
            onChange={(e) => setOTPValue(e.target.value)}
          />
          <button className="secondary-button" type="submit">
            {verifyOTPLoader ? (
              "VERIFYING..."
            ) : (
              "VERIFY"
            )}
          </button>
          <p>{error}</p>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="email"
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            id="password"
            name="password"
            placeholder="password"
            required={true}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input className="secondary-button" type="submit" />
          <p>{error}</p>
        </form>
      )}

      <hr />
      <div className="icon-container">
        <img src={playstoreicon} className="icons"></img>
        <img src={appleicon} className="icons"></img>
      </div>
    </div>
  );
};
export default AuthModal;
