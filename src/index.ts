import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command(await import("./commands/upload.js"))
  .command(await import("./commands/download.js"))
  .demandCommand()
  .completion()
  .parse();
