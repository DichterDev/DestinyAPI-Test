import downloadSQLITEDatabase from '../definitions/getDefinitions'
import Database from 'better-sqlite3';

interface queryResult {
    value: string
}

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

let db = new Database('./definitions/DestinyDefinitions.sqlite3');
db.pragma('journal_mode = WAL');


let base_url = "https://bungie.net";

export function getWeapon(hash: string): Weapon {
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

    let result = db.prepare(query).get() as queryResult;
    return JSON.parse(result.value)
}

export function getAllWeapons(): Weapon[] {
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

    let result = db.prepare(query).all() as queryResult[];
    let weapons = result.map(function(value) {
        return JSON.parse(value.value)
    })
    return weapons
}

export function getClassName(hash: string) {
    let query = `
    SELECT json_extract(
    json, '$.displayProperties.name') as value 
    FROM DestinyClassDefinition 
    WHERE json_extract(json, '$.hash') = ${hash}`;


}

export function getPerk(hash: string) {
    let query = `
    SELECT json_object(
    'hash', json_extract(json, '$.hash'),
    'name', json_extract(json, '$.displayProperties.name'), 
    'description', json_extract(json, '$.displayProperties.description'), 
    'icon', json_extract(json,'$.displayProperties.icon')) as value 
    FROM DestinyInventoryItemDefinition 
    WHERE json_extract(json, '$.hash') = ${hash}`;

    let result = db.prepare(query).get() as queryResult;
    return JSON.parse(result.value)
}

export function getPerksOfWeapon(hash: string): Perk[] {
    let weapon = getWeapon(hash);
    return weapon.perkHashes.filter(hash => hash != 0).map(function(hash) {
        return getPerk(hash.toString())
    });
}

console.log(getPerksOfWeapon('3371017761'));