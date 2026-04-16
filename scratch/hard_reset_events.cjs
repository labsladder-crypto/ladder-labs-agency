const https = require("https");

// USE SERVICE ROLE FOR DELETION AND FULL PERMISSIONS
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"; 
const ANON_KEY = process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY";
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "hsuddombpfzeroaftbct";

// HARDCODED COORDINATES TO BYPASS NOMINATIM FAILURES
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
  { 
    date: "2025-04-17", 
    name: "Goa Lounge", 
    promoter: "Lounge Eventos", 
    city: "Ribeirão Preto", 
    state: "SP", 
    lineup: ["PRADIM"], 
    genres: ["Tech House"] 
  },
  { 
    date: "2025-04-18", 
    name: "Humbuk Park", 
    promoter: "Ladder Labs", 
    city: "Florianópolis", 
    state: "SC", 
    lineup: ["RISAFFI"], 
    genres: ["Tech House"] 
  },
  { 
    date: "2025-04-18", 
    name: "Club Hype", 
    promoter: "HYPE Club", 
    city: "Poços de Caldas", 
    state: "MG", 
    lineup: ["ELOAH", "BET'S"], 
    genres: ["Tech House", "Minimal"] 
  },
  { 
    date: "2025-04-19", 
    name: "Bar do Ivo", 
    promoter: "Arara Eventos", 
    city: "Araraquara", 
    state: "SP", 
    lineup: ["EVVE"], 
    genres: ["Tech House", "Indie Dance"] 
  },
  { 
    date: "2025-04-21", 
    name: "MdOz", 
    promoter: "Aldeia Outro Mundo", 
    city: "Lagoinha", 
    state: "SP", 
    lineup: ["JUREMA"], 
    genres: ["Chill Out"] 
  },
  { 
    date: "2025-05-09", 
    name: "Alternative Sessions", 
    promoter: "Sessions", 
    city: "Ribeirão Preto", 
    state: "SP", 
    lineup: ["PAJÔ", "PRADIM", "RAFAEL LEONARDO"], 
    genres: ["Indie Dance", "House", "Tech House", "Minimal", "Techno"] 
  },
  { 
    date: "2025-05-10", 
    name: "Permita-se", 
    promoter: "Permita-se", 
    city: "Florianópolis", 
    state: "SC", 
    lineup: ["JUNNO"], 
    genres: ["Tech House"] 
  },
  { 
    date: "2025-05-10", 
    name: "Monster House", 
    promoter: "Monster House", 
    city: "Ribeirão Preto", 
    state: "SP", 
    lineup: ["NEXÜS"], 
    genres: ["Trance"] 
  },
  { 
    date: "2025-05-30", 
    name: "After Techniver", 
    promoter: "Techniver", 
    city: "Ribeirão Preto", 
    state: "SP", 
    lineup: ["NEXÜS"], 
    genres: ["Trance"] 
  },
  { 
    date: "2025-05-16", 
    name: "RaveLow", 
    promoter: "RaveLow", 
    city: "Araraquara", 
    state: "SP", 
    lineup: ["PAJÔ", "NRZ"], 
    genres: ["Techno", "Trance"] 
  },
  { 
    date: "2025-05-23", 
    name: "California Coup", 
    promoter: "California", 
    city: "Ribeirão Preto", 
    state: "SP", 
    lineup: ["JUREMA"], 
    genres: ["Open Format"] 
  },
  { 
    date: "2025-06-13", 
    name: "Polaris", 
    promoter: "Polaris", 
    city: "Ribeirão Preto", 
    state: "SP", 
    lineup: ["JUREMA"], 
    genres: ["High BPM"] 
  },
  { 
    date: "2025-06-04", 
    name: "Matão Trance", 
    promoter: "Matão Trance", 
    city: "Matão", 
    state: "SP", 
    lineup: ["JUREMA"], 
    genres: ["High BPM"] 
  },
  { 
    date: "2025-06-20", 
    name: "Florency", 
    promoter: "Florency", 
    city: "Franca", 
    state: "SP", 
    lineup: ["EVVE", "PRADIM"], 
    genres: ["Indie Dance", "Tech House"] 
  },
  { 
    date: "2025-08-09", 
    name: "Fusiondelic", 
    promoter: "Fusiondelic", 
    city: "Ribeirão Preto", 
    state: "SP", 
    lineup: ["JUREMA", "CAMP3LLO"], 
    genres: ["High BPM", "Full On"] 
  },
  { 
    date: "2025-09-19", 
    name: "Anacã", 
    promoter: "Anacã Festival", 
    city: "Altinópolis", 
    state: "SP", 
    lineup: ["JUREMA"], 
    genres: ["High BPM"] 
  },
];

async function hardResetEvents() {
  console.log("💣 Performing Hard Reset of events table...");
  return new Promise((resolve) => {
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: "/rest/v1/events?id=gt.0",
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "apikey": SERVICE_ROLE_KEY
      }
    };
    const req = https.request(options, (res) => {
      res.on("end", () => {
        console.log("✨ Table cleared.");
        resolve(true);
      });
    });
    req.on("error", (e) => {
      console.error("Failed to clear table:", e);
      resolve(false);
    });
    req.end();
  });
}

async function insertEvent(event) {
  const key = `${event.city}, ${event.state}`;
  const coords = COORDS[key] || COORDS["Ribeirão Preto, SP"]; // Default safety

  const dbEvent = {
    name: event.name,
    promoter: event.promoter,
    city: event.city,
    state: event.state,
    lat: coords.lat,
    lng: coords.lng,
    date: event.date,
    lineup: event.lineup,
    genres: event.genres,
    notes: "Manual precise location fix"
  };

  return new Promise((resolve) => {
    const body = JSON.stringify(dbEvent);
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: "/rest/v1/events",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "apikey": SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      }
    };
    const req = https.request(options, (res) => {
      res.on("end", () => resolve(res.statusCode === 201));
    });
    req.write(body);
    req.end();
  });
}

async function main() {
  const resetOk = await hardResetEvents();
  if (!resetOk) return;

  console.log("🚀 Inserting 16 manually verified events...");
  for (const event of events) {
    process.stdout.write(`Adding ${event.name} (${event.city}, ${event.state})... `);
    const ok = await insertEvent(event);
    if (ok) console.log("✅");
    else console.log("❌");
  }
}

main().catch(console.error);
