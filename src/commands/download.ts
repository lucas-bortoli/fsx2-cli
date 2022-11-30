import { Readable } from "node:stream";
import { stdin } from "process";
import yargs from "yargs";
import {
  openFileSystem,
  progressBar,
  readableFileSize,
  saveFileSystem,
  sleep,
  startSubroutine,
} from "../helpers.js";

export const command = "download <filename>";
export const describe = "download a file, writes to stdout";
export const builder = (yargs: yargs.Argv) => {
  return yargs.positional("filename", {
    describe: "the file to be download",
  });
};

export const handler = async (argv) => {
  const { filename } = argv;
  const { fsx, dataFile } = await openFileSystem(argv);

  console.error(`Downloading ${filename}...`);

  const download = await fsx.beginDownload(filename);

  const statusRoutine = startSubroutine(async () => {
    progressBar(
      readableFileSize(download.currentBytes).padStart(9) +
        " / " +
        readableFileSize(download.totalBytes).padEnd(9),
      download.currentBytes / download.totalBytes,
    );
  }, 1000);

  Readable.fromWeb(download.stream as any).pipe(process.stdout);

  await download.waitUntilDone();

  statusRoutine.stop();

  // Finish progress bar
  progressBar(
    readableFileSize(download.currentBytes).padStart(9) +
      "/" +
      readableFileSize(download.totalBytes).padStart(9),
    download.currentBytes / download.totalBytes,
  );
  console.error("");
};
