const https = require("https");

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY";
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "hsuddombpfzeroaftbct";

const COORDS = {
  "Ribeirão Preto, SP": { lat: -21.1775, lng: -47.8103 },
  "Florianópolis, SC": { lat: -27.5945, lng: -48.5477 },
  "Araraquara, SP": { lat: -21.7946, lng: -48.1755 },
  "Poços de Caldas, MG": { lat: -21.7892, lng: -46.5684 },
  "Lagoinha, SP": { lat: -23.0886, lng: -45.1873 },
  "Matão, SP": { lat: -21.6041, lng: -48.3662 },
  "Altinópolis, SP": { lat: -21.0256, lng: -47.3762 },
  "Franca, SP": { lat: -20.5333, lng: -47.4000 }
};

const events = [
  { date: "2025-04-17", name: "Goa Lounge", city: "Ribeirão Preto", state: "SP", lineup: ["PRADIM"], genres: ["Tech House"] },
  { date: "2025-04-18", name: "Humbuk Park", city: "Florianópolis", state: "SC", lineup: ["RISAFFI"], genres: ["Tech House"] },
  { date: "2025-04-18", name: "Club Hype", city: "Poços de Caldas", state: "MG", lineup: ["ELOAH", "BET'S"], genres: ["Tech House", "Minimal"] },
  { date: "2025-04-19", name: "Bar do Ivo", city: "Araraquara", state: "SP", lineup: ["EVVE"], genres: ["Indie Dance"] },
  { date: "2025-04-21", name: "MdOz", city: "Lagoinha", state: "SP", lineup: ["JUREMA"], genres: ["Chill Out"] },
  { date: "2025-05-09", name: "Alternative Sessions", city: "Ribeirão Preto", state: "SP", lineup: ["PAJÔ", "PRADIM", "RAFAEL LEONARDO"], genres: ["Indie Dance", "House", "Tech House", "Minimal", "Techno"] },
  { date: "2025-05-10", name: "Permita-se", city: "Florianópolis", state: "SC", lineup: ["JUNNO"], genres: ["Tech House"] },
  { date: "2025-05-10", name: "Monster House", city: "Ribeirão Preto", state: "SP", lineup: ["NEXÜS"], genres: ["Trance"] },
  { date: "2025-05-30", name: "After Techniver", city: "Ribeirão Preto", state: "SP", lineup: ["NEXÜS"], genres: ["Trance"] },
  { date: "2025-05-16", name: "RaveLow", city: "Araraquara", state: "SP", lineup: ["PAJÔ", "NRZ"], genres: ["Techno", "Trance"] },
  { date: "2025-05-23", name: "California Coup", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA"], genres: ["Open Format"] },
  { date: "2025-06-13", name: "Polaris", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA"], genres: ["High BPM"] },
  { date: "2025-06-04", name: "Matão Trance", city: "Matão", state: "SP", lineup: ["JUREMA"], genres: ["High BPM"] },
  { date: "2025-06-20", name: "Florency", city: "Franca", state: "SP", lineup: ["EVVE", "PRADIM"], genres: ["Indie Dance", "Tech House"] },
  { date: "2025-08-09", name: "Fusiondelic", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA", "CAMP3LLO"], genres: ["High BPM", "Full On"] },
  { date: "2025-09-19", name: "Anacã", city: "Altinópolis", state: "SP", lineup: ["JUREMA"], genres: ["High BPM"] },
  { date: "2025-04-18", name: "Makuna", city: "Ribeirão Preto", state: "SP", lineup: ["IDEMAX", "CAMP3LLO"], genres: ["Full On"] },
];

async function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (d) => data += d);
      res.on("end", () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const commonHeaders = {
    "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    "apikey": SERVICE_ROLE_KEY,
    "User-Agent": "NodeJS-Data-Fixer"
  };

  console.log("💣 Hard Clearing table...");
  const deleteRes = await request({
    hostname: `${PROJECT_REF}.supabase.co`,
    path: "/rest/v1/events?name=not.is.null",
    method: "DELETE",
    headers: commonHeaders
  });
  console.log(`Delete status: ${deleteRes.statusCode}`);

  for (const event of events) {
    const coords = COORDS[`${event.city}, ${event.state}`] || COORDS["Ribeirão Preto, SP"];
    const body = JSON.stringify({
      ...event,
      lat: coords.lat,
      lng: coords.lng,
      promoter: "Verified Location",
      notes: "HARD DATA RESET - MASTER LIST"
    });
    const insertRes = await request({
      hostname: `${PROJECT_REF}.supabase.co`,
      path: "/rest/v1/events",
      method: "POST",
      headers: { ...commonHeaders, "Content-Type": "application/json", "Prefer": "return=minimal" }
    }, body);
    console.log(`Added ${event.name} -> ${insertRes.statusCode}`);
  }
}

main().catch(console.error);
