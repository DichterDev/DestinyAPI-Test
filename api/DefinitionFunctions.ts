import downloadSQLITEDatabase from '../definitions/getDefinitions'
import { Database } from 'sqlite3'



interface Weapon {
    hash: string,
    name: string,
    flavorText: string,
    icon: string,
    perkHashes: number[],
}

interface Stat {
    hash: number,
    value: number
}

interface Perk {
    hash: string,
    name: string,
    description: string,
    icon: string
}

let db = new Database('D:\\Github\\Destiny\\DestinyAPI-Test\\definitions\\DestinyDefinitions.sqlite3');

let base_url = "https://bungie.net";

export async function getWeapon(hash: string) {
    let query = `
    SELECT json_object(
    'hash', json_extract(d.json, '$.hash'),
    'name',json_extract(d.json, '$.displayProperties.name'),
    'flavorText',json_extract(d.json, '$.flavorText'),
    'icon',json_extract(d.json, '$.displayProperties.icon'),
    'perkHashes',json_group_array(json_extract(json_each.value, '$.singleInitialItemHash'))) value
    FROM DestinyInventoryItemDefinition d,
    json_each(json_extract(d.json, '$.sockets.socketEntries'))
    WHERE json_extract(d.json, '$.hash') = ${hash}`;
    return new Promise<Weapon>(function(resolve) {
        db.get(
            query,
            (_, res:any) => resolve(JSON.parse(res['value']))
        );
    })
}

export async function getAllWeapons() {
    let query = `
    SELECT json_object(
    'hash',json_extract(d.json, '$.hash'),
    'name',json_extract(d.json, '$.displayProperties.name'),
    'flavorText',json_extract(d.json, '$.flavorText'),
    'icon',json_extract(d.json, '$.displayProperties.icon'),
    'perkHashes',json_group_array(json_extract(json_each.value, '$.singleInitialItemHash'))) value
    FROM DestinyInventoryItemDefinition d,
    json_each(json_extract(d.json, '$.sockets.socketEntries'))
    WHERE json_extract(d.json, '$.itemType') = 3
    GROUP BY d.id;`;
    
    return new Promise<Weapon[]>(function(resolve) {
        db.all(
            query,
            (_,res:any[]) => resolve(res.map(row => {
                let _row: Weapon = JSON.parse(row['value']);
                return _row;
            }))
        );
    })
}

export async function getClassName(hash: string) {
    let query = `
    SELECT json_extract(
    json, '$.displayProperties.name') as value 
    FROM DestinyClassDefinition 
    WHERE json_extract(json, '$.hash') = ${hash}`;
    return new Promise(function(resolve) {
        db.get(
            query,
            (_,res:any) => resolve(res.value)
        );
    });
}

export function getPerk(hash: string) {
    let query = `
    SELECT json_object(
    'hash', json_extract(json, '$.hash'),
    'name', json_extract(json, '$.displayProperties.name'), 
    'description', json_extract(json, '$.displayProperties.description'), 
    'icon', json_extract(json,'$.displayProperties.icon')) as value 
    FROM DestinyInventoryItemDefinition 
    WHERE json_extract(json, '$.hash') = ${hash}`
    return new Promise<Perk>(function(resolve){
        db.get(
            query,
            function(err, res: any) {
                if (err === null) {
                    resolve(JSON.parse(res.value));
                }
            }
        );
    })
}

export async function getPerksOfWeapon(hash: string) {
    let weapon: Weapon = await getWeapon(hash);
    return weapon.perkHashes.filter(perkHash => perkHash !== 0).map(async function(perkHash) {
        return await getPerk(perkHash.toString());
    })
}

async function resolveSomething() {
    // let weapon:Weapon = await getWeapon('3371017761');
    // console.log(weapon);

    // let weapons:Weapon[] = await getAllWeapons();
    // console.log(weapons);

    // let _class = await getClassName('2271682572');
    // console.log(_class);

    // let perk = await getPerk('1431678320');
    // console.log(perk);

/*     [3787406018,3492498209,1431678320,1105347996,3917450714,0,0,0,0,2302094943,1498917124,0,0,0,0,737953349].forEach(async function(perkHash) {
        let perk = await getPerk(perkHash.toString());
        console.log(perkHash);
        console.log(perk);
    }); */

    let perks = await getPerksOfWeapon('3371017761');
    console.log(perks);
}

resolveSomething();