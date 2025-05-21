import { normalize } from "formulate";
import yargs from "yargs";

const rawArgs = yargs(process.argv.slice(2)).argv;

const { result } = normalize(rawArgs, {
  convertNumbers: true,
  convertBooleans: true,
  validators: {
    port: (val) => typeof val === "number" && val > 0,
  },
});

console.log("Final Config:", result);
