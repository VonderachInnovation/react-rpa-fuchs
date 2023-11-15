import { createClient } from '@supabase/supabase-js'

//const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
//const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = "https://wjlfotjeamzgjzeovpao.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGZvdGplYW16Z2p6ZW92cGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgzMzMzMDEsImV4cCI6MjAxMzkwOTMwMX0.QqFzI0c4kvsZtYeMiqIdnl76xS-Q6qphPjaTIVoyELc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey)