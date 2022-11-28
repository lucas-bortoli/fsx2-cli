import { FileSystem, Webhook } from "@lucas-bortoli/libfsx";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export const select = <T>(...args: T[]) => {
  for (const item of args) {
    if (item !== undefined) {
      return item;
    }
  }

  throw new Error("Required parameter missing.");
};

export const openFileSystem = async (
  argv,
): Promise<{ fsx: FileSystem; key: string; dataFile: string; webhook: string }> => {
  let key: string;
  let dataFile: string;
  let webhook: string;

  key = select(argv.key, process.env.FSX_KEY, "");
  dataFile = select(argv.drive, process.env.FSX_DRIVE, "");
  webhook = select(argv.webhook, process.env.FSX_WEBHOOK);

  if (!webhook) {
    console.error(`A webhook required.`);
    process.exit(1);
  }

  const fsx = new FileSystem(new Webhook(webhook), key);

  if (dataFile && existsSync(dataFile)) {
    let data: Buffer;

    try {
      data = await readFile(dataFile);
    } catch (error) {
      console.error(`Unable to read data file ${dataFile}: ${error}`);
      process.exit(1);
    }

    await fsx.init(data);
  } else {
    await fsx.init();
  }

  return { fsx, key, dataFile, webhook };
};

export const progressBar = (label = "", percentage = -1) => {
  const components: string[] = [];

  process.stderr.clearLine(0);
  process.stderr.cursorTo(0);

  if (label) {
    components.push(label);
  }

  if (percentage >= 0) {
    percentage = Math.min(Math.round(percentage * 100.0), 100);

    components.push(percentage.toString().padStart(3) + "%");
    components.push("=".repeat(percentage).padEnd(100, " "));
  }

  process.stderr.write(components.join(" "));
};

export const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

export const readableFileSize = (size: number): string => {
  var units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  var i = 0;
  while (size >= 1024) {
    size /= 1024;
    ++i;
  }
  return size.toFixed(2) + " " + units[i];
};
