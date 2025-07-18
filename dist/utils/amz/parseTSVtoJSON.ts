
export function parseTSVtoJSON(rawData: string): any[] {
  const lines = rawData.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split("\t").map((h) => h.trim());

  const results = lines.slice(1).map((line) => {
    const cols = line.split("\t");
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = cols[idx] ? cols[idx].trim() : "";
    });
    return obj;
  });

  return results;
}
