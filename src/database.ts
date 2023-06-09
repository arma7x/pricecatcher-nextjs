import path from 'path';
const sqlite3 = require("sqlite3").verbose();

const databaseInstance = new sqlite3.Database(path.join(process.cwd(), "pricecatcher.db"));

export type SQLITE = typeof sqlite3.Database;

export type NestedObject = {
  [key: string]: any;
}

export type Premise = {
  premise_code: number,
  premise: String,
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

export type PriceJoinItem = {
  premise_code: number,
  date: String,
  price: number,
  item_code: number,
  item: String,
  unit: String,
  item_group: String,
  item_category: String,
}

export type SearchPremisesQueryOutput = {
  premises: Array<Premise>,
  previous: number | null,
  current: number,
  next: number | null,
  total: number,
  limit: number
}

function searchPremises(db: SQLITE, { state, district, premise_type, page }: any = {}, limit: number = 50): Promise<SearchPremisesQueryOutput> {
  return new Promise((resolve, reject) => {
    if (page < 1 || page == null) page = 1;
    page = parseInt(page)
    let offset = (page - 1) * limit;
    let selectCount: Array<String> = ['select COUNT(premise_code) as total from premises'];
    let select: Array<String> = ['select * from premises'];
    let where: Array<String> = ['premise_code !=-1'];
    if (state)
      where.push(`state='${state}'`);
    if (district)
      where.push(`district='${district}'`);
    if (premise_type)
      where.push(`premise_type='${premise_type}'`);
    let limitOffset: Array<String> = [`LIMIT ${limit}`, `OFFSET ${offset}`];
    select.push(`WHERE ${where.join(' AND ')}`);
    select.push(limitOffset.join(' '));
    selectCount.push(`WHERE ${where.join(' AND ')}`);
    let premises: Array<Premise> = [];
    db.serialize(() => {
      db.each(select.join(' '), (err: any, row: Premise) => {
        premises.push(row);
      }, (err: any, num: number) => {
        if (err != null) {
          reject(err);
        } else {
          let total: number = 0;
          db.each(selectCount.join(' '), (err: any, row: NestedObject) => {
            total = row.total;
          }, (err: any, num: number) => {
            if (err != null)
              reject(err);
            else {
              const result: SearchPremisesQueryOutput = {
                premises,
                previous: page > 1 ? page - 1 : null,
                current: page,
                next: ((page - 1) * limit) + premises.length < total ? page + 1 : null,
                total,
                limit
              };
              resolve(result);
            }
          });
        }
      });
    });
  });
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
    let select: Array<String> = ['SELECT prices.date, prices.item_code, prices.price, premises.* from prices '];
    let join: Array<String> = ['LEFT JOIN premises ON premises.premise_code = prices.premise_code'];
    let where: Array<String> = ['premises.premise_code not NULL', 'item_code !=-1'];
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

function getPriceListJoinItems(db: SQLITE, { premise_code, item_group, item_category }: any = {}): Promise<Array<PriceJoinItem>> {
  return new Promise((resolve, reject) => {
    let select: Array<String> = ['SELECT prices.premise_code, prices.date, prices.price, items.*  FROM prices'];
    let join: Array<String> = ['LEFT JOIN items ON prices.item_code = items.item_code'];
    let where: Array<String> = [];
    if (premise_code)
      where.push(`prices.premise_code=${premise_code}`);
    if (item_group)
      where.push(`items.item_group='${item_group}'`);
    if (item_category)
      where.push(`items.item_category='${item_category}'`);
    select.push(join.join(' '));
    if (where.length > 0)
      select.push(`WHERE ${where.join(' AND ')}`);
    let items: Array<PriceJoinItem> = [];
    db.serialize(() => {
      db.each(select.join(' '), (err: any, row: PriceJoinItem) => {
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
  getPriceListJoinItems,
  searchPremises,
}
