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
  let x = 0;
  let bytes = 0;
  while (x <= 100) {
    progressBar(readableFileSize(bytes), x/100);
    await sleep(1000);
    x++;
    bytes += Math.floor(Math.random() * 300000);
  }
};

