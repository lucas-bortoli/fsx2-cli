import { dirname } from "path";
import yargs from "yargs";
import errorCodes from "../errorCodes.js";

import {
  abort,
  openFileSystem,
  resolvePath,
  saveFileSystem,
} from "../helpers.js";

export const command = "cp <source> <target>";
export const describe = "copies a file or directory to the target path. if the <target> argument is a directory, the source is created as a child of it.";
export const builder = (yargs: yargs.Argv) => {
  return yargs.positional("source", {
    describe: "the file or directory to be copied",
  }).positional("target", {
    describe: "the target directory, or the target file name"
  });
};

export const handler = async (argv) => {
  let { source, target } = argv;
  const { fsx, dataFile } = await openFileSystem(argv);

  source = resolvePath(source);
  target = resolvePath(target);

  if (!(await fsx.exists(source))) {
    return abort(errorCodes.ERROR_FILE_OR_DIRECTORY_NOT_EXISTS, source);
  }

  fsx.copy(source, target);

  await saveFileSystem(fsx, dataFile);

  await (await import("./ls.js")).handler({ ...argv, directory: dirname(target) });
};
