import { dirname } from "path";
import yargs from "yargs";
import errorCodes from "../errorCodes.js";

import {
  abort,
  openFileSystem,
  resolvePath,
  saveFileSystem,
} from "../helpers.js";

export const command = "rm <target>";
export const describe = "deletes a file or directory";
export const builder = (yargs: yargs.Argv) => {
  return yargs.positional("target", {
    describe: "the file or directory to be deleted",
  });
};

export const handler = async (argv) => {
  let { target } = argv;
  const { fsx, dataFile } = await openFileSystem(argv);

  target = resolvePath(target);

  if (!(await fsx.exists(target))) {
    return abort(errorCodes.ERROR_FILE_OR_DIRECTORY_NOT_EXISTS, target);
  }

  fsx.delete(target);

  await saveFileSystem(fsx, dataFile);
};
