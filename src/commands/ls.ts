import { IFileSystemDirectory, IFileSystemNodeType } from "@lucas-bortoli/libfsx";
import yargs from "yargs";
import errorCodes from "../errorCodes.js";

import {
  abort,
  openFileSystem,
  plural,
  readableFileSize,
  resolvePath,
  table,
} from "../helpers.js";

export const command = "ls <directory>";
export const describe = "lists the contents of a directory";
export const builder = (yargs: yargs.Argv) => {
  return yargs.positional("directory", {
    describe: "the directory path to list",
  });
};

export const handler = async (argv) => {
  let { directory } = argv;
  const { fsx, dataFile } = await openFileSystem(argv);

  directory = resolvePath(directory);

  const node = await fsx.getNode(directory);

  if (node === null) {
    return abort(errorCodes.ERROR_FILE_OR_DIRECTORY_NOT_EXISTS, directory);
  }

  if (node.type === IFileSystemNodeType.File) {
    return abort(errorCodes.ERROR_IS_FILE, directory);
  }

  const tableData: string[][] = (node as IFileSystemDirectory).children.map((child) => {
    if (child.type === IFileSystemNodeType.File) {
      return [
        child.name,
        "file",
        readableFileSize(child.size),
        new Date(child.creationDate).toLocaleString(),
      ];
    } else {
      return [
        child.name,
        "directory",
        child.children.length + " " + plural(child.children.length, "child", "children"),
        "",
      ];
    }
  });

  const tableText = table(["left", "right", "right", "left"], true, [
    ["name", "type", "size", "created at"],
    ...tableData,
  ]);

  process.stdout.write(tableText);
  process.stdout.write("\n");
};
