// backend/services/whatsappService.js
// Uses Node's global fetch (Node 18+ / 20+). No external node-fetch required.

export async function sendWhatsAppMessage({ to, message }) {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID; // numeric id
    const apiUrl = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v17.0";

    if (!token || !phoneId) {
      throw new Error("Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID in .env");
    }

    // Ensure international format (caller should provide +91... or raw number)
    const toNumber = to.startsWith("+") ? to : `+91${to}`;

    const url = `${apiUrl}/${phoneId}/messages`;

    const body = {
      messaging_product: "whatsapp",
      to: toNumber.replace(/\+/g, ""),
      type: "text",
      text: { body: message },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ WhatsApp API Error:", data);
      throw new Error(data.error?.message || "WhatsApp API returned an error");
    }

    console.log("✅ WhatsApp sent:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ sendWhatsAppMessage error:", err.message || err);
    return { success: false, message: err.message || String(err) };
  }
}
