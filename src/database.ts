import path from 'path';
const sqlite3 = require("sqlite3").verbose();

const databaseInstance = new sqlite3.Database(path.join(process.cwd(), "pricecatcher.db"));

export type SQLITE = typeof sqlite3.Database;

export type NestedObject = {
  [key: string]: any;
}

export type Premise = {
  premise_code: number,
  permise: String,
  address: String,
  premise_type: String,
  state: String,
  district: String,
}

export type Item = {
  item_code: number,
  item: String,
  unit: String,
  item_group: String,
  item_category: String,
}

export type PriceJoinPremise = {
  date: String,
  premise_code: number,
  item_code: number,
  price: number,
  premise: String,
  address: String,
  premise_type: String,
  state: String,
  district: String,
}

export type PremisesQueryOutput = {
  premises: Array<Premise>,
  prev_page: number | null,
  next_page: number | null,
}

function searchPremises(db: SQLITE, { state, district, premise_type }: any = {}, page: number = 1, limit: number = 50) {
  if (page < 1) page = 1;
  let offset = (page - 1) * limit;
}

function searchItems(db: SQLITE, { item_group, item_category }: any = {}, limit: number | null = null): Promise<Array<Item>> {
  return new Promise((resolve, reject) => {
    let select: Array<String> = ['SELECT item_code, item, unit, item_group, item_category from items'];
    let where: Array<String> = ['item_code !=-1'];
    if (item_group != null)
      where.push(`item_group='${item_group}'`);
    if (item_category != null)
      where.push(`item_category='${item_category}'`);
    if (where.length > 0)
      select.push(`WHERE ${where.join(' AND ')}`);
    if (limit != null)
      select.push(`LIMIT ${limit}`);
    const stmt = select.join(' ');
    let items: Array<Item> = [];
    db.serialize(() => {
      db.each(stmt, (err: any, row: Item) => {
        items.push(row);
      }, (err: any, num: number) => {
        if (err != null)
          reject(err);
        else
          resolve(items);
      });
    });
  });
}

function getPriceListJoinPremises(db: SQLITE, { item_code, state, district, premise_type }: any = {}): Promise<Array<PriceJoinPremise>> {
  if (item_code == null)
    return Promise.reject('Required item_code!');
  return new Promise((resolve, reject) => {
    let select: Array<String> = ['SELECT prices.*, premises.* from prices'];
    let join: Array<String> = ['LEFT JOIN premises ON premises.premise_code = prices.premise_code'];
    let where: Array<String> = ['item_code !=-1'];
    if (item_code)
      where.push(`prices.item_code=${item_code}`);
    if (state)
      where.push(`premises.state='${state}'`);
    if (district)
      where.push(`premises.district='${district}'`);
    if (premise_type)
      where.push(`premises.premise_type='${premise_type}'`);
    let orderBy: Array<String> = ['prices.price ASC'];
    select.push(join.join(' '));
    select.push(`WHERE ${where.join(' AND ')}`);
    select.push(`ORDER BY ${orderBy.join(' ')}`);
    let priceList: Array<PriceJoinPremise> = [];
    const stmt = select.join(' ');
      let items: Array<Item> = [];
      db.serialize(() => {
        db.each(stmt, (err: any, row: PriceJoinPremise) => {
          priceList.push(row);
        }, (err: any, num: number) => {
          if (err != null)
            reject(err);
          else
            resolve(priceList);
        });
      });
  });
}

function getItemGroups(db: SQLITE): Promise<Array<String>> {
  return new Promise((resolve, reject) => {
    let groups: Array<String> = [];
    const stmt = `SELECT item_group, COUNT(item_group) AS total from items
    WHERE item_group !='UNKNOWN'
    GROUP BY item_group
    ORDER BY item_group ASC`;
    db.serialize(() => {
      db.each(stmt, (err: any, row: any) => {
        groups.push(row.item_group);
      }, (err: any, num: number) => {
        if (err != null)
          reject(err);
        else
          resolve(groups);
      });
    });
  });
}

function getItemCategories(db: SQLITE): Promise<Array<String>> {
  return new Promise((resolve, reject) => {
    let categories: Array<String> = [];
    const stmt = `SELECT item_category, COUNT(item_category) AS total from items
    WHERE item_category !='UNKNOWN'
    GROUP BY item_category
    ORDER BY item_category ASC`;
    db.serialize(() => {
      db.each(stmt, (err: any, row: any) => {
        categories.push(row.item_category);
      }, (err: any, num: number) => {
        if (err != null)
          reject(err);
        else
          resolve(categories);
      });
    });
  });
}

function getPremisesNestedLocations(db: SQLITE): Promise<NestedObject> {
  return new Promise((resolve, reject) => {
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
      }, (err: any, num: number) => {
        if (err != null)
          reject(err);
        else
          resolve(nested);
      });
    });
  });
}

const itemGroups = getItemGroups(databaseInstance);
const itemCategories = getItemCategories(databaseInstance);
const premisesNestedLocations = getPremisesNestedLocations(databaseInstance);

export {
  databaseInstance,
  itemGroups,
  itemCategories,
  premisesNestedLocations,
  searchItems,
  getPriceListJoinPremises,
}
