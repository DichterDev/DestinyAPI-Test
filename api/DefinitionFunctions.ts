import downloadSQLITEDatabase from '../definitions/getDefinitions'
import { Database } from 'sqlite3'

export async function getWeapons(id: string) {
    let db = new Database('C:\\Users\\david\\Documents\\VSCode\\DestinyAPI\\DestinyAPI-Test\\definitions\\DestinyDefinitions.sqlite3');
    db.all(
        "SELECT * from DestinyInventoryItemDefinition WHERE json_extract(json, '$.itemType') = 3",
        (_, res) => console.log(res)
    );
}