const https = require("https");

const ANON_KEY = "sb_publishable_PgQUTKWE3X4lE3tu72ZzCw_SpJsj6iy";
const PROJECT_REF = "hsuddombpfzeroaftbct";

const events = [
  { date: "2025-05-23", name: "California Coup", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA"], genres: ["Open Format"] },
  { date: "2025-06-13", name: "Polaris", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA"], genres: ["High BPM"] },
  { date: "2025-06-04", name: "Matão Trance", promoter: "Matão", state: "SP", lineup: ["JUREMA"], genres: ["High BPM"] },
  { date: "2025-06-20", name: "Florency", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["EVVE", "PRADIM"], genres: ["Tech House"] },
  { date: "2025-08-09", name: "Fusiondelic", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA", "CAMP3LLO"], genres: ["High BPM", "Full On"] },
  { date: "2025-09-19", name: "Anacã", promoter: "Ladder Labs", city: "Altinópolis", state: "SP", lineup: ["JUREMA"], genres: ["High Bpm"] },
];

const DEFAULTS = {
  "Ribeirão Preto": { lat: -21.1775, lng: -47.8103 },
  "Matão": { lat: -21.6033, lng: -48.3658 },
  "Altinópolis": { lat: -21.0258, lng: -47.3758 },
  "Araraquara": { lat: -21.7944, lng: -48.1756 }
};

async function geocode(city, state, venue) {
  // Use defaults if available
  if (DEFAULTS[city]) {
    // Add a tiny bit of jitter so pins don't overlap perfectly
    return { 
      lat: DEFAULTS[city].lat + (Math.random() - 0.5) * 0.01, 
      lng: DEFAULTS[city].lng + (Math.random() - 0.5) * 0.01 
    };
  }
  return null;
}

async function insertEvent(event) {
  const coords = await geocode(event.city || event.promoter, event.state, event.name);
  if (!coords) {
    console.log(`⚠️ Skip ${event.name}: No default or geocoding found.`);
    return;
  }

  const dbEvent = {
    ...event,
    promoter: event.promoter || event.name,
    city: event.city || event.promoter,
    lat: coords.lat,
    lng: coords.lng,
    notes: "Batch added via agent (auto-pin)"
  };

  return new Promise((resolve) => {
    const body = JSON.stringify(dbEvent);
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: "/rest/v1/events",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ANON_KEY}`,
        "apikey": ANON_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      }
    };

    const req = https.request(options, (res) => {
      res.on("data", () => {});
      res.on("end", () => resolve(res.statusCode === 201));
    });
    req.on("error", () => resolve(false));
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log(`Retrying batch insertion for skipped ${events.length} events...`);
  for (const event of events) {
    process.stdout.write(`Adding ${event.name} (${event.date})... `);
    const ok = await insertEvent(event);
    if (ok) console.log("✅");
    else console.log("❌");
    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch(console.error);
