import { parseRowEntry } from "../services/CsvService";
import BookeeMod from "./BookeeMod";

export default class BookeeEntry {
  id?: number;
  pOne: number;
  pTwo: number;
  dateDay: number;
  dateMonth: number;
  dateYear: number;
  mods: BookeeMod[];

  constructor(
    id?: number,
    pOne?: number,
    pTwo?: number,
    dateDay?: number,
    dateMonth?: number,
    dateYear?: number,
    mods?: BookeeMod[]
  ) {
    this.id = id;
    this.pOne = pOne || 0;
    this.pTwo = pTwo || 0;
    this.dateDay = dateDay || 0;
    this.dateMonth = dateMonth || 0;
    this.dateYear = dateYear || 0;
    this.mods = mods || [];
  }
}

export function isBookeeEntry(arg: Array<string>): boolean {
  const pOneCheck =
    arg[1] !== undefined &&
    typeof arg[1] == "string" &&
    arg[1].trim().length > 0;
  const pTwoCheck =
    arg[2] !== undefined &&
    typeof arg[2] == "string" &&
    arg[2].trim().length > 0;
  const dateCheck =
    arg[0] !== undefined &&
    typeof arg[0] == "string" &&
    arg[0].trim().length > 0 &&
    arg[0].split(".").length === 3;

  return arg && pOneCheck && pTwoCheck && dateCheck;
}

export const makeBookeeEntryFromRow = (row: Array<string>): BookeeEntry => {
  return new BookeeEntry(
    parseRowEntry(row[3]),
    parseRowEntry(row[1]),
    parseRowEntry(row[2]),
    parseRowEntry(row[0].split(".")[0]),
    parseRowEntry(row[0].split(".")[1]),
    parseRowEntry(row[0].split(".")[2])
  );
};
