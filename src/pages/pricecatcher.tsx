import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Item, databaseInstance, itemGroups, itemCategories, premisesNestedLocations, searchItems  } from '../database';

function PriceCatcher({ itemGroups, itemCategories, premisesNestedLocations, initialItems }: any) {

  const flexRow: {[key: string]: any} = {
    display: 'flex',
    flexDirection: 'row'
  };

  const marginLeft: {[key: string]: any} = {
    marginLeft: '5px'
  };

  const [items, setItems] = useState([]);
  const [group, setGroup] = useState(false);
  const [category, setCategory] = useState(false);
  const [state, setState] = useState(false);
  const [district, setDistrict] = useState(false);
  const [premiseType, setPremiseType] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, []);

  const handleGroupChange = (event: any) => {
    setGroup(itemGroups.indexOf(event.target.value) > -1 ? event.target.value : false);
  }

  const handleCategoryChange = (event: any) => {
    setCategory(itemCategories.indexOf(event.target.value) > -1 ? event.target.value : false);
  }

  const handleStateChange = (event: any) => {
    setState(Object.keys(premisesNestedLocations).indexOf(event.target.value) > -1 ? event.target.value : false);
    setDistrict(false);
    setPremiseType(false);
  };

  const handleDistrictChange = (event: any) => {
    if (Object.keys(premisesNestedLocations[state.toString()]).indexOf(event.target.value) > -1) {
      setDistrict(event.target.value);
      if (premisesNestedLocations[state.toString()][event.target.value].indexOf(premiseType) < 0)
        setPremiseType(false);
    } else {
      setDistrict(false);
    }
  };

  const handlePremiseTypeChange = (event: any) => {
    if (premisesNestedLocations[state.toString()][district.toString()].indexOf(event.target.value) > -1)
      setPremiseType(event.target.value);
    else
      setPremiseType(false);
  };

  async function searchItems(event: any) {
    try {
      const query: {[key: string]: any} = {};
      if (group) query.item_group = group;
      if (category) query.item_category = category;
      setItems(await (await fetch('/api/searchItems?' + new URLSearchParams(query))).json());
    } catch (err: any) {
      console.log(err);
    }
  }

  async function showPriceListJoinPremises(item_code: number) {
    try {
      const query: {[key: string]: any} = {};
      query.item_code = item_code;
      if (state)
        query.state = state;
      if (district)
        query.district = district;
      if (premiseType)
        query.premise_type = premiseType;
      const priceList = await (await fetch('/api/priceListJoinPremises?' + new URLSearchParams(query))).json();
      console.log(priceList);
    } catch (err: any) {
      console.log(err);
    }
  }

  return (
    <>
      <Head>
        <title>Senarai Barangan</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div style={{ ...flexRow, justifyContent: 'space-between' }}>

          <div style={flexRow}>
            <div>
              <select id="item_group" name="item_group" onChange={handleGroupChange}>
                {['Pilih Kumpulan', ...itemGroups].map((name) => {
                  return (<option key={name} value={name}>{name}</option>);
                })}
              </select>
            </div>

            <div style={marginLeft}>
              <select id="item_category" name="item_category" onChange={handleCategoryChange}>
                {['Pilih Kategori', ...itemCategories].map((name) => {
                  return (<option key={name} value={name}>{name}</option>);
                })}
              </select>
            </div>
            <button style={marginLeft} onClick={searchItems}>Cari Barangan</button>
          </div>

          <div style={flexRow}>
            <div style={marginLeft}>
              <select id="state" name="state" onChange={handleStateChange}>
                {['Pilih Negeri', ...(Object.keys(premisesNestedLocations))].map((name) => {
                  return (<option key={name} value={name}>{name}</option>);
                })}
              </select>
            </div>

            {
              state &&
              <div style={marginLeft}>
              <select id="district" name="district" onChange={handleDistrictChange}>
                {['Pilih Daerah', ...(Object.keys(premisesNestedLocations[state.toString()]))].map((name) => {
                  return (<option key={name} value={name}>{name}</option>);
                })}
               </select>
              </div>
            }

            {
              district &&
              <div style={marginLeft}>
              <select id="premise_type" name="premise_type" onChange={handlePremiseTypeChange}>
                {['Pilih Jenis Premis', ...premisesNestedLocations[state.toString()][district.toString()]].map((name) => {
                  return (<option key={name} value={name}>{name}</option>);
                })}
               </select>
              </div>
            }
          </div>

        </div>

        <div>
          <table>
            <thead>
              <tr>
                <th>Kod Barangan</th>
                <th>Nama</th>
                <th>Unit</th>
                <th>Kumpulan</th>
                <th>Kategori</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: Item) => {
                return (
                  <tr key={item.item_code}>
                    <td>{item.item_code}</td>
                    <td>{item.item}</td>
                    <td>{item.unit}</td>
                    <td>{item.item_group}</td>
                    <td>{item.item_category}</td>
                    <td><button onClick={() => showPriceListJoinPremises(item.item_code)}>Papar Harga</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      </main>
    </>
  )
}

export async function getStaticProps() {
  try {
    const a = await itemGroups;
    const b = await itemCategories;
    const c = await premisesNestedLocations;
    const d = await searchItems(databaseInstance, {}, 50);
    return {
      props: {
        itemGroups: a,
        itemCategories: b,
        premisesNestedLocations: c,
        initialItems: d,
      },
    }
  } catch (err: any) {
    throw(err);
  }
}

export default PriceCatcher
