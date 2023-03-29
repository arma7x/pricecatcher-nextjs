import { useState, useEffect } from 'react';
import Head from 'next/head';
import { PriceJoinItem, NestedObject, Premise, SearchPremisesQueryOutput, itemGroups, itemCategories, databaseInstance, premisesNestedLocations, searchPremises } from '../database';
import Modal from '../Modal';
import { flexRow, marginLeft, thPadTop } from '../styles/styles';

function Premises({ itemGroups, itemCategories, premisesNestedLocations, initialPremises }: any) {

  let result: SearchPremisesQueryOutput = {} as SearchPremisesQueryOutput;

  const [premise, setPremise] = useState({});
  const [visible, setVisibility] = useState(false);
  const [premises, setPremises] = useState<Array<Premise>>([]);
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number|null>(0);
  const [previous, setPrevious] = useState<number|null>(0);
  const [state, setState] = useState(false);
  const [district, setDistrict] = useState(false);
  const [premiseType, setPremiseType] = useState(false);
  const [items, setItems] = useState([]);
  const [group, setGroup] = useState(false);
  const [category, setCategory] = useState(false);

  useEffect(() => {
    setPremises(initialPremises.premises);
    setCurrent(initialPremises.current);
    setNext(initialPremises.next);
    setPrevious(initialPremises.previous);
  }, [initialPremises]);

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

  async function searchPremises(event: any) {
    const query: {[key: string]: any} = {};
    if (state) query.state = state;
    if (district) query.district = district;
    if (premiseType) query.premise_type = premiseType;
    _searchPremises(query);
  }

  async function _searchPremises(query: NestedObject) {
    try {
      result = await (await fetch('/api/searchPremises?' + new URLSearchParams(query))).json();
      setPremises(result.premises);
      setCurrent(result.current);
      setNext(result.next);
      setPrevious(result.previous);
    } catch (err: any) {
      console.log(err);
    }
  }

  function toggleModal() {
    const t = !visible;
    setVisibility(t);
  }

  function selectPremise(premise: Premise) {
    setPremise(premise);
    setItems([]);
    toggleModal();
  }

  async function searchItems(event: any) {
    try {
      const query: {[key: string]: any} = {};
      if (premise) query.premise_code = premise.premise_code;
      if (group) query.item_group = group;
      if (category) query.item_category = category;
      setItems(await (await fetch('/api/priceListJoinItems?' + new URLSearchParams(query))).json());
    } catch (err: any) {
      console.log(err);
    }
  }

  return (
    <>
      <Head>
        <title>Senarai Premis</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div style={{ ...flexRow, alignItems: 'center', justifyContent: 'space-between', position: 'fixed', zIndex: 99, backgroundColor: '#fff', width: '100%', height: '50px' }}>
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
            <button style={marginLeft} onClick={searchPremises}>Cari Premis</button>
          </div>
          <div style={flexRow}>
            {
              previous != null &&
              <button style={marginLeft} onClick={() => {
                const query: {[key: string]: any} = {};
                if (state) query.state = state;
                if (district) query.district = district;
                if (premiseType) query.premise_type = premiseType;
                query.page = previous;
                _searchPremises(query);
              }}>&lt; {previous}</button>
            }
            <button style={marginLeft} disabled><div>Halaman {current}</div></button>
            {
              next != null &&
              <button style={marginLeft} onClick={() => {
                const query: {[key: string]: any} = {};
                if (state) query.state = state;
                if (district) query.district = district;
                if (premiseType) query.premise_type = premiseType;
                query.page = next;
                _searchPremises(query);
              }}>{next} &gt;</button>
            }
          </div>
        </div>
        <div style={{ position: 'absolute', marginTop: '50px' }}>
          <Modal visibility={visible} setVisibility={setVisibility}>
            {
              Object.keys(premise.length > 0) &&
              <div style={{ ...flexRow, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', width: '100%' }}>
                <h3>
                  {premise["premise"]}, {premise["address"]}
                </h3>
                <h3>
                  {premise["premise_type"]}, {premise["state"]}, {premise["district"]}
                </h3>
              </div>
            }
            <div style={{ ...flexRow, alignItems: 'center', position: 'sticky', top: 0, zIndex: 99, backgroundColor: '#fff', width: '100%', height: '50px' }}>
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
            <div>
              <table>
                <thead>
                  <tr>
                    <th style={thPadTop}>Kod Barangan</th>
                    <th style={thPadTop}>Kod Premise</th>
                    <th style={thPadTop}>Tarikh</th>
                    <th style={thPadTop}>Barangan</th>
                    <th style={thPadTop}>Unit</th>
                    <th style={thPadTop}>Kumpulan</th>
                    <th style={thPadTop}>Kategori</th>
                    <th style={thPadTop}>Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: PriceJoinItem) => {
                    return (
                      <tr key={item.item_code}>
                        <td>{item.item_code}</td>
                        <td>{item.premise_code}</td>
                        <td>{item.date}</td>
                        <td>{item.item}</td>
                        <td>{item.item}</td>
                        <td>{item.item_group}</td>
                        <td>{item.item_category}</td>
                        <td>RM{parseFloat(item.price).toFixed(2)}</td>
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
                <th style={thPadTop}>Kod Premis</th>
                <th style={thPadTop}>Premis</th>
                <th style={thPadTop}>Alamat</th>
                <th style={thPadTop}>Jenis Premis</th>
                <th style={thPadTop}>Negeri</th>
                <th style={thPadTop}>Daerah</th>
                <th style={thPadTop}>Pilih</th>
              </tr>
            </thead>
            <tbody>
              {premises.map((premise: Premise) => {
                return (
                  <tr key={premise.premise_code}>
                    <td>{premise.premise_code}</td>
                    <td>{premise.premise}</td>
                    <td>{premise.premise}</td>
                    <td>{premise.premise_type}</td>
                    <td>{premise.state}</td>
                    <td>{premise.district}</td>
                    <td><button onClick={() => selectPremise(premise)}>Papar Barangan</button></td>
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
    const d = await searchPremises(databaseInstance, {});
    return {
      props: {
        itemGroups: a,
        itemCategories: b,
        premisesNestedLocations: c,
        initialPremises: d,
      },
    }
  } catch (err: any) {
    throw(err);
  }
}

export default Premises
