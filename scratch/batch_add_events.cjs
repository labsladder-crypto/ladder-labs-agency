const https = require("https");

const ANON_KEY = "sb_publishable_PgQUTKWE3X4lE3tu72ZzCw_SpJsj6iy";
const PROJECT_REF = "hsuddombpfzeroaftbct";

const events = [
  { date: "2025-04-17", name: "Goa Lounge", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["PRADIM"], genres: ["House"] },
  { date: "2025-04-18", name: "Humbuk Park", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["RISAFFI"], genres: ["Tech House"] },
  { date: "2025-04-18", name: "Club Hype", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["ELOAH", "BET'S"], genres: ["Tech House", "Minimal"] },
  { date: "2025-04-19", name: "Bar do Ivo", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["EVVE"], genres: ["Tech House", "Indie Dance"] },
  { date: "2025-04-21", name: "MdOz", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA"], genres: ["Chill Out"] },
  { date: "2025-05-09", name: "Alternative Sessions", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["PAJÔ", "PRADIM", "RAFAEL LEONARDO"], genres: ["House"] },
  { date: "2025-05-10", name: "Permita-se", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["JUNNO"], genres: ["Tech House"] },
  { date: "2025-05-10", name: "Monster House", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["NEXÜS"], genres: ["Trance"] },
  { date: "2025-05-30", name: "After Techniver", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["NEXÜS"], genres: ["Trance"] },
  { date: "2025-05-16", name: "RaveLow", promoter: "Ladder Labs", city: "Araraquara", state: "SP", lineup: ["PAJÔ", "NRZ"], genres: ["Techno", "Psy"] },
  { date: "2025-05-23", name: "California Coup", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA"], genres: ["Open Format"] },
  { date: "2025-06-13", name: "Polaris", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA"], genres: ["High BPM"] },
  { date: "2025-06-04", name: "Matão Trance", promoter: "Ladder Labs", city: "Matão", state: "SP", lineup: ["JUREMA"], genres: ["High BPM"] },
  { date: "2025-06-20", name: "Florency", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["EVVE", "PRADIM"], genres: ["Tech House"] },
  { date: "2025-08-09", name: "Fusiondelic", promoter: "Ladder Labs", city: "Ribeirão Preto", state: "SP", lineup: ["JUREMA", "CAMP3LLO"], genres: ["High BPM", "Full On"] },
  { date: "2025-09-19", name: "Anacã", promoter: "Ladder Labs", city: "Altinópolis", state: "SP", lineup: ["JUREMA"], genres: ["High Bpm"] },
];

async function geocode(city, state, venue) {
  return new Promise((resolve) => {
    // Try venue first
    const q1 = encodeURIComponent(`${venue}, ${city}, ${state}, Brasil`);
    https.get(`https://nominatim.openstreetmap.org/search?format=json&q=${q1}`, {
      headers: { "User-Agent": "LadderLabsBatchInserter" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const results = JSON.parse(data);
          if (results.length > 0) return resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
          // Fallback to city center
          const q2 = encodeURIComponent(`${city}, ${state}, Brasil`);
          https.get(`https://nominatim.openstreetmap.org/search?format=json&q=${q2}`, {
            headers: { "User-Agent": "LadderLabsBatchInserter" }
          }, (res2) => {
            let data2 = "";
            res2.on("data", chunk => data2 += chunk);
            res2.on("end", () => {
              try {
                const r2 = JSON.parse(data2);
                if (r2.length > 0) resolve({ lat: parseFloat(r2[0].lat), lng: parseFloat(r2[0].lon) });
                else resolve(null);
              } catch { resolve(null); }
            });
          });
        } catch { resolve(null); }
      });
    });
  });
}

async function insertEvent(event) {
  const coords = await geocode(event.city, event.state, event.name);
  if (!coords) {
    console.log(`⚠️ Skip ${event.name}: No location found.`);
    return;
  }

  const dbEvent = {
    ...event,
    lat: coords.lat,
    lng: coords.lng,
    notes: "Batch added via agent"
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
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        if (res.statusCode === 201) resolve(true);
        else {
          console.log(`Error: ${res.statusCode} - ${data}`);
          resolve(false);
        }
      });
    });
    req.on("error", (e) => {
      console.log(`Req Error: ${e.message}`);
      resolve(false);
    });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log(`Starting batch insertion of ${events.length} events...`);
  for (const event of events) {
    process.stdout.write(`Adding ${event.name} (${event.date})... `);
    const ok = await insertEvent(event);
    if (ok) console.log("✅");
    else console.log("❌");
    await new Promise(r => setTimeout(r, 1200));
  }
}

main().catch(console.error);
