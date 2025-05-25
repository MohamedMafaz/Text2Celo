# 📲 Celo SMS Sender – Mini Hackathon Project

This project was developed as part of the **Celo Mini Hackathon**. It enables sending Celo tokens via SMS using a backend server, an ngrok tunnel, and a mobile phone that acts as the message receiver.

> 📹 **Demo Video:** [Watch on YouTube](https://youtu.be/0kE1kN0h29c)

---

## ⚙️ Getting Started

To run this project, follow the steps below:

### 1. Start the Backend Server

In the backend directory, run the following command:

```bash
node index.js
```

This will start your server on port `4000`.

---

### 2. Start ngrok

Open a **new terminal window** and start an ngrok tunnel for port 4000:

```bash
ngrok http 4000
```

You will see a forwarding URL like:

```
https://cd5a-2409-40f4-214c-8be4-6d78-8dc-f8e1-542d.ngrok-free.app
```

Copy this URL and **append `/sms`** to it:

```
https://cd5a-2409-40f4-214c-8be4-6d78-8dc-f8e1-542d.ngrok-free.app/sms
```

---

### 3. Set the Webhook

Go to **[httpsms.com/settings](https://httpsms.com/settings/)** and paste the URL with `/sms` as your webhook:

```
https://<your-ngrok-url>.ngrok-free.app/sms
```

---

## 📱 Important Notes

* The receiver phone used is an **Infinix Mobile** with the number **+91 6369056117**.
* Your phone **must remain powered on** to receive and process messages.
* After running `ngrok`, you must enter the **current forwarding URL** into the receiver app.
* Because this system relies on a **live SMS receiver**, it's **not possible to test the project independently**.

> 🧑‍💻 If you’d like to test the project, feel free to **call me at +91 6369056117**, and we can set up a **Google Meet** for a walkthrough and live demonstration.

---

## 💬 Message Format

To send a Celo transaction, use the following SMS format:

```
send 0x54Db142A0f8B9683783183316e6DCe8309e6079e 1
```

Where:

* `0x54Db...` is the **receiver wallet address**.
* `1` is the **amount** of Celo tokens to send.

---

## 🏆 Developed For

**Celo Mini Hackathon**
A quick innovation challenge to showcase real-world applications built on the Celo blockchain.

---

## 📞 Contact

* 📱 **Phone:** +91 6369056117
* 🎥 **Demo:** [YouTube Video](https://youtu.be/0kE1kN0h29c)

