import BookeeEntry, {
  isBookeeEntry,
  makeBookeeEntryFromRow,
} from "../types/BookeeEntry";
import { isBookeeModEntry, makeBookeeModFromRow } from "../types/BookeeMod";
import {
  reciveByAttributes,
  saveNew,
  saveNewFromList,
  update,
} from "./DatabaseService";

export const scanImportedJson = (csv: Array<any>) => {
  let listOfBookeeEntries: Array<BookeeEntry> = [];
  console.log("Raw", csv);
  csv.slice(3).forEach((row: Array<string>) => {
    switch (true) {
      case isBookeeEntry(row):
        listOfBookeeEntries.push(makeBookeeEntryFromRow(row));
        break;
      case isBookeeModEntry(row):
        let bookeeEntry: BookeeEntry | undefined = listOfBookeeEntries.pop();
        if (bookeeEntry !== undefined) {
          bookeeEntry.mods.push(makeBookeeModFromRow(row));
          listOfBookeeEntries.push(bookeeEntry);
        }
        break;
      default:
        console.log("Not matched", row);
        break;
    }
  });
  console.log("Processed", listOfBookeeEntries);
  saveInDB(listOfBookeeEntries);
};

export const saveInDB = async (listOfBookeeEntries: Array<BookeeEntry>) => {
  let listOfNew = [...listOfBookeeEntries];
  await saveNewFromList("entries", listOfNew);
  console.log("Done saving");
};

export const parseRowEntry = (entry: string): number => {
  return parseInt(
    entry.replaceAll("€", "").trim().replaceAll(".", "").replaceAll(",", "")
  );
};

export const updateListsWith = (bookeeEntryJson: BookeeEntry[]) => {
  bookeeEntryJson.forEach((entry: BookeeEntry) => {
    reciveByAttributes(
      "[dateDay+dateMonth+dateYear]",
      [[entry.dateDay, entry.dateMonth, entry.dateYear]],
      (data: unknown) => {
        if (data === undefined) {
          console.log(`New Entry on ${entry.dateDay, entry.dateMonth, entry.dateYear} will be saved.`);
          saveNew(entry);
        }
      }
    );
  });
};
