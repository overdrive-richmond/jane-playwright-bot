import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("Jane bot is alive"));

// Webhook endpoint
app.post("/book", async (req, res) => {
  // Auth check
  if (req.headers["x-webhook-secret"] !== process.env.WEBHOOK_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  console.log("Incoming:", req.body);

  // Respond immediately so Zapier doesn't time out
  res.status(200).json({ status: "received" });

  // Do the actual booking in the background
  try {
    await bookOnJane(req.body);
    console.log("Booking complete for:", req.body.patient_name);
  } catch (err) {
