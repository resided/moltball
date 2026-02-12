/**
 * Output formatting — human-readable by default, --json for agents.
 */

let jsonMode = false;

export function setJsonMode(enabled: boolean) {
  jsonMode = enabled;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

export function output(data: any, humanFn?: (data: any) => string) {
  if (jsonMode) {
    console.log(JSON.stringify(data, null, 2));
  } else if (humanFn) {
    console.log(humanFn(data));
  } else {
    // Default human-readable
    console.log(JSON.stringify(data, null, 2));
  }
}

export function error(message: string, data?: any) {
  if (jsonMode) {
    console.error(JSON.stringify({ error: message, ...data }));
  } else {
    console.error(`Error: ${message}`);
    if (data) console.error(data);
  }
  process.exit(1);
}

export function table(rows: Record<string, any>[], columns?: string[]) {
  if (jsonMode) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (rows.length === 0) {
    console.log("(empty)");
    return;
  }

  const cols = columns || Object.keys(rows[0]);
  const widths = cols.map((col) => {
    const maxData = Math.max(...rows.map((r) => String(r[col] ?? "").length));
    return Math.max(col.length, maxData);
  });

  // Header
  const header = cols.map((col, i) => col.padEnd(widths[i])).join("  ");
  console.log(header);
  console.log(widths.map((w) => "-".repeat(w)).join("  "));

  // Rows
  for (const row of rows) {
    const line = cols.map((col, i) => String(row[col] ?? "").padEnd(widths[i])).join("  ");
    console.log(line);
  }
}
