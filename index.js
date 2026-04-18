import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json());

app.post("/book", async (req, res) => {
  const data = req.body;
  console.log("Incoming:", data);

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  try {
    // 🔐 LOGIN
    await page.goto("https://YOURCLINIC.janeapp.com/login");

    await page.fill('input[name="email"]', process.env.JANE_EMAIL);
    await page.fill('input[name="password"]', process.env.JANE_PASSWORD);

    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");

    // 📅 GO TO SCHEDULE
    await page.goto("https://YOURCLINIC.janeapp.com/admin/schedule");

    // ⏱️ TEMP: click a sample time (we'll make dynamic later)
    await page.click("text=10:00 AM");

    // 👤 SEARCH PATIENT
    await page.fill('input[placeholder="Search"]', data.patient_name);
    await page.waitForTimeout(1000);

    // Click patient if exists (you will refine this)
    await page.click(`text=${data.patient_name}`);

    // 💾 SAVE
    await page.click('button:has-text("Save")');

    await browser.close();

    res.json({ status: "success" });

  } catch (err) {
    console.error(err);
    await browser.close();
    res.json({ status: "error", error: err.message });
  }
});

app.listen(3000, () => console.log("Server running"));
