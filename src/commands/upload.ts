import { Writable } from "node:stream";
import { stdin } from "process";
import yargs from "yargs";
import { openFileSystem, progressBar, readableFileSize, sleep } from "../helpers.js";

export const command = "upload <filename>";
export const describe = "upload a file from stdin to the specified location";
export const builder = (yargs: yargs.Argv) => {
  return yargs.positional("filename", {
    describe: "where the filename will be stored",
  });
};

export const handler = async (argv) => {
  const { filename } = argv;
  const { fsx } = await openFileSystem(argv);

  if (process.stdin.isTTY) {
    console.error("Pipe some data to this command to start an upload.");
    console.error("\n    $ cat data.txt | " + process.argv.slice(2).join(" ") + " upload ...");
    process.exit(1);
  }

  console.log(`Uploading to ${filename}...`);

  const upload = await fsx.beginUpload(filename);

  let stop = false;
  (async () => {
    while (!stop) {
      progressBar(readableFileSize(upload.totalBytes).padStart(9));
      // progressBar(readableFileSize(bytes).padStart(9), x/100);
      await sleep(1000);
    }
  })();

  process.stdin.pipe(Writable.fromWeb(upload.stream));

  await upload.waitUntilDone();
  stop = true;
};

