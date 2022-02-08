import Dexie from "dexie";
import BookeeEntry from "../types/BookeeEntry";

export class BookeeDB extends Dexie {
  entries: Dexie.Table<BookeeEntry, number>; // number = type of the primkey

  constructor() {
    super("BookeeDB");
    this.version(2).stores({
      entries: "++id, [dateDay+dateMonth+dateYear], pOne, pTwo, dateDay,dateMonth,dateYear, mods",
    });

    this.entries = this.table("entries");
  }
}
