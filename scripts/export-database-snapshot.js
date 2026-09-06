import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Read credentials from process.env or .env.local
let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envText = fs.readFileSync(envPath, "utf-8");
    envText.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim();
        if (key === "VITE_SUPABASE_URL" || key === "SUPABASE_URL") supabaseUrl = supabaseUrl || val;
        if (key === "SUPABASE_SERVICE_ROLE_KEY" || key === "VITE_SUPABASE_ANON_KEY") supabaseKey = supabaseKey || val;
      }
    });
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportSnapshot() {
  const tables = ["projects", "achievements", "activities", "experiences", "site_stats"];
  const snapshot = {
    exported_at: new Date().toISOString(),
    tables: {},
  };

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      console.warn(`Table ${table} error:`, error.message);
      snapshot.tables[table] = { error: error.message, count: 0, rows: [] };
    } else {
      console.log(`Fetched ${data?.length || 0} rows from ${table}`);
      snapshot.tables[table] = { count: data?.length || 0, rows: data || [] };
    }
  }

  const outputJsonPath = path.resolve(process.cwd(), "docs", "private", "database_snapshot.json");
  fs.writeFileSync(outputJsonPath, JSON.stringify(snapshot, null, 2), "utf-8");
  console.log(`Saved JSON snapshot to: ${outputJsonPath}`);

  // Create human-readable markdown summary
  let mdContent = `# Supabase Database Snapshot\n\n`;
  mdContent += `**Exported At:** ${snapshot.exported_at}\n\n`;
  mdContent += `## Table Summary\n\n`;

  for (const [tableName, tableInfo] of Object.entries(snapshot.tables)) {
    mdContent += `### 📊 Table: \`${tableName}\` (${tableInfo.count} rows)\n\n`;
    if (tableInfo.count === 0) {
      mdContent += `*(No records found)*\n\n`;
      continue;
    }
    const sampleRow = tableInfo.rows[0];
    const columns = Object.keys(sampleRow);
    mdContent += `**Active Columns (${columns.length}):** \`${columns.join("`, `")}\`\n\n`;

    tableInfo.rows.forEach((row, i) => {
      const title = row.title || row.name || `Row #${row.id || i + 1}`;
      mdContent += `<details>\n<summary><b>${i + 1}. ${title}</b> (ID: ${row.id || "N/A"})</summary>\n\n\`\`\`json\n${JSON.stringify(row, null, 2)}\n\`\`\`\n</details>\n\n`;
    });
  }

  const outputMdPath = path.resolve(process.cwd(), "docs", "private", "database_snapshot.md");
  fs.writeFileSync(outputMdPath, mdContent, "utf-8");
  console.log(`Saved Markdown snapshot to: ${outputMdPath}`);
}

exportSnapshot().catch(console.error);
