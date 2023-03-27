import { useState } from 'react';
import Head from 'next/head';
import { itemGroups, itemCategories, premisesNestedLocations } from '../database';

function PriceCatcher({ itemGroups, itemCategories, premisesNestedLocations }: any) {

  const [group, setGroup] = useState(false);
  const [category, setCategory] = useState(false);
  const [state, setState] = useState(false);
  const [district, setDistrict] = useState(false);
  const [premiseType, setPremiseType] = useState(false);

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

  return (
    <>
      <Head>
        <title>Senarai Barangan</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div style={{ display: 'flex', 'flexDirection': 'row' }}>
          <div>
            <select id="item_group" name="item_group" onChange={handleGroupChange}>
              {['Pilih Kumpulan', ...itemGroups].map((name) => {
                return (<option key={name} value={name}>{name}</option>);
              })}
            </select>
          </div>

          <div style={{ 'marginLeft': '5px' }}>
            <select id="item_category" name="item_category" onChange={handleCategoryChange}>
              {['Pilih Kategori', ...itemCategories].map((name) => {
                return (<option key={name} value={name}>{name}</option>);
              })}
            </select>
          </div>

          <div style={{ 'marginLeft': '5px' }}>
            <select id="state" name="state" onChange={handleStateChange}>
              {['Pilih Negeri', ...(Object.keys(premisesNestedLocations))].map((name) => {
                return (<option key={name} value={name}>{name}</option>);
              })}
            </select>
          </div>

          {
            state &&
            <div style={{ 'marginLeft': '5px' }}>
            <select id="district" name="district" onChange={handleDistrictChange}>
              {['Pilih Daerah', ...(Object.keys(premisesNestedLocations[state.toString()]))].map((name) => {
                return (<option key={name} value={name}>{name}</option>);
              })}
             </select>
            </div>
          }

          {
            district &&
            <div style={{ 'marginLeft': '5px' }}>
            <select id="premise_type" name="premise_type" onChange={handlePremiseTypeChange}>
              {['Pilih Jenis Premis', ...premisesNestedLocations[state.toString()][district.toString()]].map((name) => {
                return (<option key={name} value={name}>{name}</option>);
              })}
             </select>
            </div>
          }

        </div>
        <div>
          <div>Kumpulan: {group}</div>
          <div>Kategory: {category}</div>
          <div>Negeri: {state}</div>
          <div>Daerah: {district}</div>
          <div>Jenis Premis: {premiseType}</div>
        </div>
      </main>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      itemGroups,
      itemCategories,
      premisesNestedLocations,
    },
  }
}

export default PriceCatcher
