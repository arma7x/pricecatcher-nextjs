#!/usr/bin/node

const fs  = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const AdmZip = require("adm-zip");

async function downloadDatabaseBlob(fileURL, filePath) {
  const blob = await (await fetch(`${fileURL}?time=${new Date().getTime()}`)).arrayBuffer();
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, new Uint8Array(blob), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      };
    });
  });
}

async function checkLatestFileSize(fileURL) {
  try {
    const headerResponse = await fetch(`${fileURL}?time=${new Date().getTime()}`, { method: 'HEAD' });
    if (headerResponse.headers.has('content-length')) {
      return Promise.resolve(parseInt(headerResponse.headers.get('content-length') || '0'));
    }
    return Promise.reject('content-length header is missing');
  } catch (err) {
    return Promise.reject(err);
  }
}

function checkLocalFileSize(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.size
  } catch (err) {
    return 0;
  }
}

async function uncompressZip(filePath) {
  console.log('Uncompress database');
  const zip = new AdmZip(filePath);
  const zipEntries = zip.getEntries();
  zipEntries.forEach(function (zipEntry) {
    if (zipEntry.entryName == "/pricecatcher.db") {
      fs.writeFile(path.join(process.cwd(), "pricecatcher.db"), zipEntry.getData(), (err) => {
        if (err) {
          throw(err);
        } else {
          console.log('Done uncompress database');
        }
      });
    }
  });
}

(async function() {
  const filePath = path.join(process.cwd(), "pricecatcher.zip");
  const fileURL = "https://raw.githubusercontent.com/arma7x/opendosm-parquet-to-sqlite/master/pricecatcher.zip";

  let localFileSize = checkLocalFileSize(filePath);
  let latestFileSize = 0;

  try {
    latestFileSize = await checkLatestFileSize(fileURL);
  } catch (err) {
    console.log(err);
  }

  console.log('Local File size:', localFileSize);
  console.log('Latest File size:', latestFileSize);

  if (localFileSize === 0 && latestFileSize === 0) {
    throw("Database file not available");
  } else if (localFileSize !== latestFileSize && latestFileSize !== 0) {
    console.log('Download database');
    try {
      await downloadDatabaseBlob(fileURL, filePath);
      console.log('Done download database');
      uncompressZip(filePath);
    } catch (err) {
      throw(err);
    }
  } else {
    uncompressZip(filePath);
  }
})();
