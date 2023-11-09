import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import playstoreicon from "../images/playstore-icon.png";
import appleicon from "../images/apple-icon.png";

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
    setOtpLoader(true);
    const response = await axios.post(`http://localhost:8000/signup`, {
      email,
      password,
    });
    if (response.status === 409) setError("User already exists");
    const success = response.status === 201;
    if (success && isSignUp) {
      setPassword("");
      setOTPValue("");
      setSendOTP(false);
    }
    setOtpLoader(false);
    // return;
  };

  const checkOTP = async (e) => {
    e.preventDefault();
    setVerifyOTPLoader(true);
    const verifyOTP = await axios.post(`http://localhost:8000/verifyUser`, {
      email,
      otpValue,
    });
    setVerifyOTPLoader(false);
    if (verifyOTP && isSignUp) {
      const success = verifyOTP.status === 200;
      console.log(verifyOTP);
      setCookie("AuthToken", verifyOTP.data.token);
      setCookie("UserId", verifyOTP.data.userId);
      if (success && isSignUp) navigate("/onboarding");
      if (success && !isSignUp) navigate("/dashboard");
    } else console.log(error);
  };

  console.log("Cookies:", cookies);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp && password !== confirmPassword) {
        setError("Passwords need to match!");
        return;
      }
      // if (isSignUp && password.length < 8) {
      //   setError(
      //     "Invalid password. Password must contain at least 8 characters, including one letter, one number, and one special character."
      //   );
      //   return;
      // }

      // if (
      //   !/[a-zA-Z]/.test(password) ||
      //   !/\d/.test(password) ||
      //   !/[!@#$%^&*()_+]/.test(password)
      // ) {
      //   setError(
      //     "Invalid password. Password must contain at least 8 characters, including one letter, one number, and one special character."
      //   );
      //   return;
      // }

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
      console.log(error);
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
              <>
                <Hearts
                  height="20"
                  width="350"
                  color="red"
                  ariaLabel="hearts-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </>
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
              <>
                <Hearts
                  height="20"
                  width="350"
                  color="red"
                  ariaLabel="hearts-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </>
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
