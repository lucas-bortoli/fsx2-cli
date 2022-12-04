export interface ErrorCode {
  code: number,
  message: string
}

const errorCodes = {
  SUCCESS: { code: 0, message: "Success" },
  ERROR_FILE_OR_DIRECTORY_NOT_EXISTS: { code: -1, message: "File or directory doesn't exist" },
  ERROR_IS_FILE: { code: -2, message: "Target is a file" },
  ERROR_IS_DIRECTORY: { code: -3, message: "Target is a directory" }
};

export default errorCodes;
