import fs from "node:fs";
import path from "node:path";
import MemoryTimelineClient, { type YearMemories, type MemoryPhoto } from "./MemoryTimelineClient";

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function humanize(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[\-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function readYear(year: number, publicDir: string): MemoryPhoto[] {
  const dir = path.join(publicDir, "memories", String(year));
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && exts.has(path.extname(e.name).toLowerCase()))
    .map((e) => ({
      src: `/memories/${year}/${e.name}`,
      caption: humanize(e.name),
    }));
  return files;
}

export default async function MemoryTimeline() {
  // Resolve the project root public dir relative to this file
  const publicDir = path.join(process.cwd(), "public");
  const groups: YearMemories[] = YEARS.map((y) => ({ year: y, photos: readYear(y, publicDir) }))
    // ensure years with no photos still render a node
    .map((g) => ({ ...g, photos: g.photos.slice(0, 24) }));

  return <MemoryTimelineClient groups={groups} />;
}
