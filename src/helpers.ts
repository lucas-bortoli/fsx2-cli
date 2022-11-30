import { FileSystem, Webhook } from "@lucas-bortoli/libfsx";
import fsp from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";

export const select = <T>(...args: T[]) => {
  for (const item of args) {
    if (item !== undefined) {
      return item;
    }
  }
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
    console.error(
      `A webhook must be specified, either via the --webhook parameter or $FSX_WEBHOOK environment variable.`,
    );
    process.exit(1);
  } else if (!dataFile) {
    console.error(
      `A data file must be specified, either via the --drive parameter or $FSX_DRIVE environment variable.`,
    );
    process.exit(1);
  }

  const fsx = new FileSystem(new Webhook(webhook), key);

  if (dataFile && existsSync(dataFile)) {
    let data: Buffer;

    try {
      data = await fsp.readFile(dataFile);
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

export const saveFileSystem = async (fsx: FileSystem, dataFile: string) => {
  const fsData = await fsx.export();

  console.error(`Writing data file to: ${dataFile}`);

  if (!existsSync(dirname(dataFile))) {
    console.error(`Unable to write data file: Containing directory doesn't exist.`);
  }

  fsp.writeFile(dataFile, fsData);
};

export const progressBar = (label = "", percentage = -1) => {
  const components: string[] = [];

  process.stderr.clearLine(0);
  process.stderr.cursorTo(0);

  if (label) {
    components.push(label);
  }

  if (percentage >= 0) {
    const unrounded = Math.min(Math.round(percentage * 100.0), 100);
    percentage = Math.min(Math.round(percentage * 20.0), 20);

    components.push(unrounded.toString().padStart(3) + "%");
    components.push("[" + "=".repeat(percentage).padEnd(20, "-") + "]");
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

export const startSubroutine = (callbackFn: () => Promise<void>, interval: number) => {
  let stop = false;

  (async () => {
    while (!stop) {
      await callbackFn();
      await sleep(interval);
    }
  })();

  return {
    stop: () => {
      stop = true;
    },
  };
};
