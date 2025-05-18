import express from "express";
import ethers from "ethers";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

app.post("/send-celo", async (req, res) => {
  const { to, amount } = req.body;

  try {
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
    });

    await tx.wait();
    res.json({ success: true, hash: tx.hash });
  } catch (err) {
    console.error("Transaction Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/sms", async (req, res) => {
  // Extract sender and message from the nested data object
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
      // Call internal send-celo endpoint
      const response = await axios.post("http://localhost:4000/send-celo", { to, amount });
      const txHash = response.data.hash;

      res.set("Content-Type", "text/xml");
      return res.send(
        `<Response><Message>✅ Sent ${amount} CELO to ${to}\nTxHash: ${txHash}</Message></Response>`
      );
    } catch (error) {
      console.error("⚠️ Send Error:", error.message);

      res.set("Content-Type", "text/xml");
      return res.send(
        `<Response><Message>❌ Error: ${error.response?.data?.error || error.message}</Message></Response>`
      );
    }
  } else {
    res.set("Content-Type", "text/xml");
    return res.send(
      `<Response><Message>⚠️ Invalid format.\nUse: send &lt;address&gt; &lt;amount&gt;</Message></Response>`
    );
  }
});

app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
