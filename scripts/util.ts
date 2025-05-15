export function successHandler(output: String | object) {
  if (typeof output === "string") {
    console.log(`\nSuccess: ${output}`);
  } else if (typeof output === "object") {
    console.log(JSON.stringify(output, undefined, 2));
  }

  process.exit(0);
}

export function errorHandler<T extends Error>(error: T) {
  // ProgramError
  if (error["code"] && error["msg"]) {
    console.error("\n" + `Error ${error["code"]}: ${error["msg"]}`);

    if (error["logs"]) {
      console.error("\n" + error["logs"].join("\n"));
    }
  } else {
    console.error("\n" + error.message);
  }

  process.exit(1);
}

export function logVar(variableName: string, variableValue: string | object) {
  console.log(variableName + ": " + variableValue.toString());
}
