/**
 * Supabase Client — Ladder Labs
 * Real-time event sync for the Event Radar.
 * Keys stored locally in .git-token (never committed to GitHub).
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hsuddombpfzeroaftbct.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdWRkb21icGZ6ZXJvYWZ0YmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjQ0NzIsImV4cCI6MjA5MTk0MDQ3Mn0.rR4u_Z2g24vVue4WYs4bpcObsYu3NG1XOC_S9LIi80I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
