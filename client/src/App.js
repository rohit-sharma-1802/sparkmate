import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OnBoarding from "./pages/OnBoarding";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useCookies } from "react-cookie";
import React from "react";

const App = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  const userID = cookies.userId;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {userID && <Route path="/dashboard" element={<Dashboard />} />}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
