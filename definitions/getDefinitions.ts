import fs from 'fs';
import axios from 'axios';
import https from 'https';
import JSZip from 'jszip';

const c_requiredDefinitions = [
    'DestinyClassDefinition', 
    'DestinyDamageTypeDefinition', 
    'DestinyEnergyTypeDefinition', 
    'DestinyInventoryItemLiteDefinition', 
    'DestinyItemTierTypeDefinition', 
    'DestinySandboxPerkDefinition',
]
const c_manifest_url = 'https://www.bungie.net/Platform/Destiny2/Manifest/';

const config = {
    headers: {
        'X-API-KEY': 'f9ff6ab51ae74090a8671ee3c367c1cc'
    }
}

async function getSQLITEManifestURL() {
    let data: any = (await axios.get(c_manifest_url, config)).data['Response'];
    let sqlite_url: string = 'https://www.bungie.net' + `${data['mobileWorldContentPaths']['en']}`
    return sqlite_url;
}

function extractZIPFile(filePath: string) {
    // https://stackoverflow.com/a/39324475
    fs.readFile(filePath, function(err, data) {
        if (!err) {
            var zip = new JSZip();
            zip.loadAsync(data).then(function(contents) {
                Object.keys(contents.files).forEach(function(filename) {
                    zip.file(filename)?.async('nodebuffer').then(function(content) {
                        let dest: string = './definitions/DestinyDefinitions.sqlite3';
                        fs.writeFileSync(dest, content);
                    });
                });
            });
        }
    });
}

async function downloadSQLITEDatabase() {
    let url: string = await getSQLITEManifestURL();
    let filename: string = 'DestinyDefinitions.zip';

    let file = fs.createWriteStream(filename);
    let path = file.path.toString();

    console.log(url);

    let req = new Promise<void>((resolve, reject) => {
        https.get(url, function(response) {
            response.pipe(file);
          
            file.on('finish', function() {
              file.close();
              console.log(`Downloaded ${filename}`);
              resolve();
            });
          }).on('error', function(err) {
            fs.unlink(filename, () => {});
            console.error(`Error downloading ${url}: ${err.message}`);
            reject();
        });
    });

    await req;
    

    // Extract .zip file

    extractZIPFile(path);

};

downloadSQLITEDatabase();

export default downloadSQLITEDatabase;