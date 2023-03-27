import path from 'path';
const sqlite3 = require("sqlite3").verbose();

const databaseInstance = new sqlite3.Database(path.join(process.cwd(), "pricecatcher.db"));

export type NestedObject = {
  [key: string]: any;
}

function getItemGroups(db: typeof sqlite3.Database): Array<String> {
  let groups: Array<String> = [];
  const stmt = `SELECT item_group, COUNT(item_group) AS total from items
  WHERE item_group !='UNKNOWN'
  GROUP BY item_group
  ORDER BY item_group ASC`;
  db.serialize(() => {
    db.each(stmt, (err: any, row: any) => {
      groups.push(row.item_group);
    });
  });
  return groups;
}

function getItemCategories(db: typeof sqlite3.Database): Array<String> {
  let categories: Array<String> = [];
  const stmt = `SELECT item_category, COUNT(item_category) AS total from items
  WHERE item_category !='UNKNOWN'
  GROUP BY item_category
  ORDER BY item_category ASC`;
  db.serialize(() => {
    db.each(stmt, (err: any, row: any) => {
      categories.push(row.item_category);
    });
  });
  return categories;
}

function getPremisesNestedLocations(db: typeof sqlite3.Database): NestedObject {
  let nested: NestedObject = {};
  const stmt = `SELECT state, district, premise_type from premises
  WHERE premise_code!=-1
  GROUP BY state, district, premise_type
  ORDER BY state ASC`;
  db.serialize(() => {
    db.each(stmt, (err: any, row: any) => {
      if (nested[row.state] == null)
        nested[row.state] = {};
      if (nested[row.state][row.district] == null)
        nested[row.state][row.district] = [];
      nested[row.state][row.district].push(row.premise_type);
    });
  });
  return nested;
}

const itemGroups = getItemGroups(databaseInstance);
const itemCategories = getItemCategories(databaseInstance);
const premisesNestedLocations = getPremisesNestedLocations(databaseInstance);

export {
  databaseInstance,
  itemGroups,
  itemCategories,
  premisesNestedLocations,
}
