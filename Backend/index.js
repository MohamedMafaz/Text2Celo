import express from "express";
import ethers from "ethers";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors()); // Allow CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set up ethers provider
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

// In-memory users store for demo (replace with DB or Supabase)
const users = new Map();

app.post("/register", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "phone_number is required" });

  try {
    const newWallet = ethers.Wallet.createRandom();

    // Save user data in-memory (key = phone)
    users.set(phone, {
      address: newWallet.address,
      privateKey: newWallet.privateKey, // Be careful in real apps
    });

    res.json({
      phone,
      address: newWallet.address,
      privateKey: newWallet.privateKey,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/send-celo", async (req, res) => {
  const { from_phone, to, amount } = req.body;
  console.log("🔥 /send-celo called with:", { from_phone, to, amount });

  try {
    // Get user's wallet from phone number
    const userData = users.get(from_phone);
    if (!userData) {
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    // Create wallet instance from user's private key
    const userWallet = new ethers.Wallet(userData.privateKey, provider);
    
    // Check balance before sending
    const balance = await userWallet.getBalance();
    const amountWei = ethers.utils.parseEther(amount);
    
    if (balance.lt(amountWei)) {
      return res.status(400).json({ 
        error: `Insufficient balance. Balance: ${ethers.utils.formatEther(balance)} CELO` 
      });
    }

    // Send transaction from user's wallet
    const tx = await userWallet.sendTransaction({
      to,
      value: amountWei,
    });

    console.log("✅ Transaction sent! Hash:", tx.hash);
    console.log(`📤 Sent from: ${userWallet.address} to: ${to}`);

    await tx.wait();
    console.log("🎉 Transaction mined!");

    res.json({ 
      success: true, 
      hash: tx.hash,
      from: userWallet.address,
      to: to,
      amount: amount
    });
  } catch (error) {
    console.error("🚨 Transaction Error:", {
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: error.message });
  }
});

app.post("/sms", async (req, res) => {
  const from = req.body.data?.contact;
  const body = req.body.data?.content;

  console.log("📩 Incoming SMS Payload:", req.body);
  console.log(`📨 Received SMS from ${from}: ${body}`);

  if (!body) {
    res.set("Content-Type", "text/xml");
    return res.send(`<Response><Message>❌ Missing message body</Message></Response>`);
  }

  const parts = body.trim().split(" ");

  if (parts.length === 3 && parts[0].toLowerCase() === "send") {
    const to = parts[1];
    const amount = parts[2];

    try {
      // Send from_phone in the request to identify which user's wallet to use
      const response = await axios.post("http://localhost:4000/send-celo", { 
        from_phone: from, 
        to, 
        amount 
      });
      
      const { hash: txHash, from: fromAddress } = response.data;

      res.set("Content-Type", "text/xml");
      return res.send(
        `<Response><Message>✅ Sent ${amount} CELO to ${to}\nFrom: ${fromAddress}\nTxHash: ${txHash}</Message></Response>`
      );
    } catch (error) {
      console.error("⚠️ Send Error:", error.message);
      
      let errorMsg = error.response?.data?.error || error.message;
      
      res.set("Content-Type", "text/xml");
      return res.send(
        `<Response><Message>❌ Error: ${errorMsg}</Message></Response>`
      );
    }
  } else if (parts.length === 1 && parts[0].toLowerCase() === "balance") {
    // Check balance command
    try {
      const userData = users.get(from);
      if (!userData) {
        res.set("Content-Type", "text/xml");
        return res.send(
          `<Response><Message>❌ User not found. Please register first.</Message></Response>`
        );
      }

      const userWallet = new ethers.Wallet(userData.privateKey, provider);
      const balance = await userWallet.getBalance();
      const balanceEther = ethers.utils.formatEther(balance);

      res.set("Content-Type", "text/xml");
      return res.send(
        `<Response><Message>💰 Your balance: ${balanceEther} CELO\nAddress: ${userData.address}</Message></Response>`
      );
    } catch (error) {
      console.error("⚠️ Balance Error:", error.message);
      res.set("Content-Type", "text/xml");
      return res.send(
        `<Response><Message>❌ Error checking balance: ${error.message}</Message></Response>`
      );
    }
  } else {
    res.set("Content-Type", "text/xml");
    return res.send(
      `<Response><Message>⚠️ Invalid format.\nCommands:\n• send &lt;address&gt; &lt;amount&gt;\n• balance</Message></Response>`
    );
  }
});

// Add endpoint to get user info
app.get("/user/:phone", (req, res) => {
  const { phone } = req.params;
  const userData = users.get(phone);
  
  if (!userData) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json({
    phone,
    address: userData.address,
    // Don't return private key in GET requests for security
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});