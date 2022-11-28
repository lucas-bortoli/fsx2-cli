import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command(await import("./commands/upload.js"))
  .demandCommand()
  .completion()
  .parse();
