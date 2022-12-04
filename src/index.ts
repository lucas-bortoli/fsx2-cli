import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command(await import("./commands/upload.js"))
  .command(await import("./commands/download.js"))
  .command(await import("./commands/ls.js"))
  .command(await import("./commands/rm.js"))
  .command(await import("./commands/mv.js"))
  .command(await import("./commands/cp.js"))
  .demandCommand()
  .completion()
  .parse();
