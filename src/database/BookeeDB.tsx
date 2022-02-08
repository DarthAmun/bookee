import Dexie from "dexie";
import BookeeEntry from "../types/BookeeEntry";

export class BookeeDB extends Dexie {
  entries: Dexie.Table<BookeeEntry, number>; // number = type of the primkey

  constructor() {
    super("BookeeDB");
    this.version(1).stores({
      entries: "++id, pOne, pTwo, dateDay,dateMonth,dateYear, mods",
    });

    this.entries = this.table("entries");
  }
}
