// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Bookings from "./pages/Bookings";
import PaymentDetails from "./pages/PaymentDetails";
import Rules from "./pages/Rules";
import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>

      {/* Navbar − visible on all pages */}
      <Navbar />

      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Rules Page */}
        <Route path="/rules" element={<Rules />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Pages */}
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/roomdetails" element={<RoomDetails />} />
        <Route path="/bookings" element={<Bookings />} />

        {/* Payment Details Page */}
        <Route path="/paymentdetails" element={<PaymentDetails />} />

        {/* 404 Page */}
        <Route
          path="*"
          element={<h3 className="m-5 text-center">Page Not Found</h3>}
        />

      </Routes>
    </BrowserRouter>
  );
}
