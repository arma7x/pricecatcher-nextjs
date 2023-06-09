import { useState, useEffect } from 'react';
import Head from 'next/head';
import { NestedObject, Item, PriceJoinPremise, databaseInstance, itemGroups, itemCategories, premisesNestedLocations, searchItems } from '../database';
import Modal from '../Modal';
import { flexRow, marginLeft, thPadTop } from '../styles/styles';

function PriceCatcher({ itemGroups, itemCategories, premisesNestedLocations, initialItems }: any) {

  const [item, setItem] = useState<Item|NestedObject>({});
  const [visible, setVisibility] = useState(false);
  const [priceList, setPriceList] = useState([]);
  const [items, setItems] = useState<Array<Item>>([]);
  const [group, setGroup] = useState(false);
  const [category, setCategory] = useState(false);
  const [state, setState] = useState(false);
  const [district, setDistrict] = useState(false);
  const [premiseType, setPremiseType] = useState(false);

  const padTop: {[key: string]: any} = {
    top: '65px',
    marginTop: '65px'
  };

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

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
      let items: Array<Item> = await (await fetch('/api/searchItems?' + new URLSearchParams(query))).json();
      setItems(items);
      if (items.length === 0)
        alert("Hasil carian 0");
    } catch (err: any) {
      console.log(err);
    }
  }

  async function showPriceListJoinPremises(item: Item) {
    try {
      setItem(item);
      const query: {[key: string]: any} = {};
      query.item_code = item.item_code;
      if (state)
        query.state = state;
      if (district)
        query.district = district;
      if (premiseType)
        query.premise_type = premiseType;
      const priceList = await (await fetch('/api/priceListJoinPremises?' + new URLSearchParams(query))).json();
      setPriceList(priceList);
      if (priceList.length === 0)
        alert("Hasil carian 0");
      if (priceList.length > 0) {
        setVisibility(true);
      }
    } catch (err: any) {
      console.log(err);
    }
  }

  function toggleModal() {
    const t = !visible;
    setVisibility(t);
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
        <div style={{ ...flexRow, alignItems: 'center', justifyContent: 'space-between', position: 'fixed', zIndex: 99, backgroundColor: '#fff', width: '100%', height: '50px' }}>
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

        <div style={{ position: 'absolute', marginTop: '50px' }}>
          <Modal visibility={visible} setVisibility={setVisibility}>
            {
              Object.keys(item).length > 0 &&
              <div style={{ ...flexRow, alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 99, backgroundColor: '#fff', width: '100%', height: '65px' }}>
                <h3>
                  Kod Barangan: {item["item_code"]}, {item["item"]}, {item["unit"]}
                </h3>
                <h3>
                  {item["item_group"]}, {item["item_category"]}
                </h3>
              </div>
            }
            <div>
              <table>
                <thead>
                  <tr>
                    <th style={padTop}>Tarikh</th>
                    <th style={padTop}>Kod Premis</th>
                    <th style={padTop}>Kod Barangan</th>
                    <th style={padTop}>Harga</th>
                    <th style={padTop}>Premis</th>
                    <th style={padTop}>Alamat</th>
                    <th style={padTop}>Jenis Premis</th>
                    <th style={padTop}>Negeri</th>
                    <th style={padTop}>Daerah</th>
                  </tr>
                </thead>
                <tbody>
                  {priceList.map((item: PriceJoinPremise) => {
                    return (
                      <tr key={item.item_code.toString() + '_' + item.premise_code.toString()}>
                        <td>{item.date}</td>
                        <td>{item.premise_code}</td>
                        <td>{item.item_code}</td>
                        <td>RM{item.price.toFixed(2)}</td>
                        <td>{item.premise}</td>
                        <td>{item.address}</td>
                        <td>{item.premise_type}</td>
                        <td>{item.state}</td>
                        <td>{item.district}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Modal>
          <table>
            <thead>
              <tr>
                <th style={thPadTop}>Kod Barangan</th>
                <th style={thPadTop}>Nama</th>
                <th style={thPadTop}>Unit</th>
                <th style={thPadTop}>Kumpulan</th>
                <th style={thPadTop}>Kategori</th>
                <th style={thPadTop}>Harga</th>
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
                    <td><button onClick={() => showPriceListJoinPremises(item)}>Papar Harga</button></td>
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
