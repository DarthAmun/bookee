import { parseRowEntry } from "../services/CsvService";

export default class BookeeMod {
  pOneMod: number | undefined;
  pTwoMod: number | undefined;

  constructor(pOneMod?: number | undefined, pTwoMod?: number | undefined) {
    this.pOneMod = pOneMod;
    this.pTwoMod = pTwoMod;
  }
}

export function isBookeeModEntry(arg: Array<string>): boolean {
  const pOneModCheck =
    arg[1] !== undefined &&
    typeof arg[1] == "string" &&
    arg[1].trim().length > 0;
  const pTwoModCheck =
    arg[2] !== undefined &&
    typeof arg[2] == "string" &&
    arg[2].trim().length > 0;

  return (
    arg && ((!pOneModCheck && pTwoModCheck) || (pOneModCheck && !pTwoModCheck))
  );
}

export const makeBookeeModFromRow = (row: Array<string>): BookeeMod => {
  if (
    row[1] !== undefined &&
    typeof row[1] == "string" &&
    row[1].trim().length > 0
  ) {
    return new BookeeMod(parseRowEntry(row[1]), undefined);
  } else {
    return new BookeeMod(undefined, parseRowEntry(row[2]));
  }
};
