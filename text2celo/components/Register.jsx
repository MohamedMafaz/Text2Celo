import React, { useState } from "react";
import "./Register.css";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    setError(null);
    setResult(null);

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || "Unknown error");
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h2 className="bye">Register on Text2Celo to</h2>
      <h2 className="hi">Create New Wallet</h2>
      <input
        type="text"
        placeholder="+919999999999"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {result && (
        <div style={{ marginTop: 20 }}>
          <p>Phone: {result.phone}</p>
          <p>Address: {result.address}</p>
          <p>Private Key: {result.privateKey}</p>
          <p><b>Save your private key securely!</b></p>
        </div>
      )}
    </div>
  );
}
