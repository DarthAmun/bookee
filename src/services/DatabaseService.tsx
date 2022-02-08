import { IndexableType } from "dexie";
import { BookeeDB } from "../database/BookeeDB";
import BookeeEntry from "../types/BookeeEntry";

export const saveNewFromList = (tableName: string, entities: BookeeEntry[]) => {
  const db = new BookeeDB();
  db.open()
    .then(async function () {
      const refinedEntities = (entities as BookeeEntry[]).map(
        (entity: BookeeEntry) => {
          delete entity["id"];
          return entity;
        }
      );
      const prom = await db.table(tableName).bulkPut(refinedEntities);
      return prom;
    })
    .finally(function () {
      db.close();
    });
};

export const reciveAll = (
  tableName: string,
  callback: (data: IndexableType[]) => void
) => {
  const db = new BookeeDB();
  db.open()
    .then(function () {
      db.table(tableName)
        .orderBy("dateYear")
        .toArray()
        .then((array) => {
          callback(array);
        });
    })
    .finally(function () {
      db.close();
    });
};

export const reciveYears = (callback: (data: IndexableType[]) => void) => {
  const db = new BookeeDB();
  db.open()
    .then(function () {
      db.table("entries")
        .orderBy("dateYear")
        .reverse()
        .uniqueKeys(function (array) {
          callback(array);
        });
    })
    .finally(function () {
      db.close();
    });
};

export const update = (data: BookeeEntry) => {
  const db = new BookeeDB();
  db.open()
    .then(function () {
      db.table("entries").update(data.id, data);
    })
    .finally(function () {
      db.close();
    });
};

export const saveNew = (entity: BookeeEntry) => {
  const db = new BookeeDB();
  return db
    .open()
    .then(async function () {
      delete entity["id"];
      const prom = await db.table("entries").put(entity);
      return prom;
    })
    .finally(function () {
      db.close();
    });
};

export const remove = (id: number | undefined) => {
  const db = new BookeeDB();
  if (id !== undefined) {
    db.open()
      .then(function () {
        db.table("entries").delete(id);
      })
      .finally(function () {
        db.close();
      });
  }
};
