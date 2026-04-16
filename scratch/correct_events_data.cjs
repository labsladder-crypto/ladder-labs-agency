const https = require("https");

const ANON_KEY = "sb_publishable_PgQUTKWE3X4lE3tu72ZzCw_SpJsj6iy";
const PROJECT_REF = "hsuddombpfzeroaftbct";

const events = [
  { 
    date: "2025-04-17", 
    name: "Goa Lounge", 
    promoter: "Lounge Eventos", 
    city: "Ribeirão Preto", 
    state: "SP", 
    address: "Rua Comandante Marcondes Salgado, 1621, Boulevard, Ribeirão Preto - SP, 14025-160",
    lineup: ["PRADIM"], 
    genres: ["Tech House"] 
  },
  { 
    date: "2025-04-18", 
    name: "Humbuk Park", 
    promoter: "Lagoa", 
    city: "Florianópolis", 
    state: "SC", 
    address: "R. Henrique Vera do Nascimento, 153 - Lagoa da Conceição, Florianópolis - SC, 88062-020",
    lineup: ["RISAFFI"], 
    genres: ["Tech House"] 
  },
  { 
    date: "2025-04-18", 
    name: "Club Hype", 
    promoter: "Hype Club", 
    city: "Poços de Caldas", 
    state: "MG", 
    address: "Av. João Pinheiro, 1120, Poços de Caldas - MG",
    lineup: ["ELOAH", "BET'S"], 
    genres: ["Tech House"] 
  },
  { 
    date: "2025-04-19", 
    name: "Bar do Ivo", 
    promoter: "Arara Eventos", 
    city: "Araraquara", 
    state: "SP", 
    address: "R. Armando de Salles Oliveira, 1219 - Vila Yamada, Araraquara - SP, 14802-175",
    lineup: ["EVVE"], 
    genres: ["Indie Dance"] 
  },
  { 
    date: "2025-04-21", 
    name: "MdOz", 
    promoter: "Aldeia Outro Mundo", 
    city: "Lagoinha", 
    state: "SP", 
    address: "Aldeia Outro Mundo, Lagoinha - SP",
    lineup: ["JUREMA"], 
    genres: ["Chill Out"] 
  },
  { 
    date: "2025-05-09", 
    name: "Alternative Sessions", 
    promoter: "Sessions", 
    city: "Ribeirão Preto", 
    state: "SP", 
    address: "Av. Pres. Vargas, 1117 - Alto da Boa Vista, Ribeirão Preto - SP, 14020-260",
    lineup: ["PAJÔ", "PRADIM", "RAFAEL LEONARDO"], 
    genres: ["Indie Dance", "House", "Tech House", "Minimal", "Techno"] 
  },
  { 
    date: "2025-05-10", 
    name: "Permita-se", 
    promoter: "Permita-se", 
    city: "Florianópolis", 
    state: "SC", 
    address: "Florianopolis, SC",
    lineup: ["JUNNO"], 
    genres: ["Tech House"] 
  },
  { 
    date: "2025-05-10", 
    name: "Monster House", 
    promoter: "Monster House", 
    city: "Ribeirão Preto", 
    state: "SP", 
    address: "Ribeirão Preto, SP",
    lineup: ["NEXÜS"], 
    genres: ["Trance"] 
  },
  { 
    date: "2025-05-30", 
    name: "After Techniver", 
    promoter: "Techniver", 
    city: "Ribeirão Preto", 
    state: "SP", 
    address: "Ribeirão Preto, SP",
    lineup: ["NEXÜS"], 
    genres: ["Trance"] 
  },
  { 
    date: "2025-05-16", 
    name: "RaveLow", 
    promoter: "RaveLow", 
    city: "Araraquara", 
    state: "SP", 
    address: "Clube Ascar, Araraquara - SP",
    lineup: ["PAJÔ", "NRZ"], 
    genres: ["Techno", "Trance"] 
  },
  { 
    date: "2025-05-23", 
    name: "California Coup", 
    promoter: "California", 
    city: "Ribeirão Preto", 
    state: "SP", 
    address: "Ribeirão Preto, SP",
    lineup: ["JUREMA"], 
    genres: ["Open Format"] 
  },
  { 
    date: "2025-06-13", 
    name: "Polaris", 
    promoter: "Polaris", 
    city: "Ribeirão Preto", 
    state: "SP", 
    address: "Clube dos Gráficos, Ribeirão Preto - SP",
    lineup: ["JUREMA"], 
    genres: ["High BPM"] 
  },
  { 
    date: "2025-06-04", 
    name: "Matão Trance", 
    promoter: "Matão Trance", 
    city: "Matão", 
    state: "SP", 
    address: "Matão, SP",
    lineup: ["JUREMA"], 
    genres: ["High BPM"] 
  },
  { 
    date: "2025-06-20", 
    name: "Florency", 
    promoter: "Florency", 
    city: "Franca", 
    state: "SP", 
    address: "Franca, SP",
    lineup: ["EVVE", "PRADIM"], 
    genres: ["Indie Dance", "Tech House"] 
  },
  { 
    date: "2025-08-09", 
    name: "Fusiondelic", 
    promoter: "Fusiondelic", 
    city: "Ribeirão Preto", 
    state: "SP", 
    address: "Ribeirão Preto, SP",
    lineup: ["JUREMA", "CAMP3LLO"], 
    genres: ["High BPM", "Full On"] 
  },
  { 
    date: "2025-09-19", 
    name: "Anacã", 
    promoter: "Anacã Festival", 
    city: "Altinópolis", 
    state: "SP", 
    address: "Vale Das Grutas, Altinópolis - SP",
    lineup: ["JUREMA"], 
    genres: ["High BPM"] 
  },
];

async function geocode(address) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(`${address}, Brasil`);
    const options = {
      hostname: "nominatim.openstreetmap.org",
      path: `/search?q=${query}&format=json&limit=1&countrycodes=br`,
      headers: { "User-Agent": "LadderLabsDataCorrection" }
    };
    https.get(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const results = JSON.parse(data);
          if (results.length > 0) resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
          else resolve(null);
        } catch { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

async function clearOldEvents() {
  return new Promise((resolve) => {
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: "/rest/v1/events?id=gt.0",
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${ANON_KEY}`,
        "apikey": ANON_KEY
      }
    };
    const req = https.request(options, (res) => {
      res.on("end", () => resolve(true));
    });
    req.end();
  });
}

async function insertEvent(event) {
  const coords = await geocode(event.address || event.city);
  if (!coords) {
    console.log(`⚠️ Skip ${event.name}: No location found.`);
    return;
  }

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
    notes: "Data updated with precise addresses by agent"
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
      res.on("end", () => resolve(res.statusCode === 201));
    });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("Cleaning old placeholder data...");
  await clearOldEvents();
  console.log("Starting insertion of corrected events...");
  for (const event of events) {
    process.stdout.write(`Adding ${event.name} (${event.city})... `);
    const ok = await insertEvent(event);
    if (ok) console.log("✅");
    else console.log("❌");
    await new Promise(r => setTimeout(r, 1200)); // Respect OSM rate limits
  }
}

main().catch(console.error);
