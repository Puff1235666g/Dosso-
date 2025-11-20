import fetch from 'node-fetch';
import logger from './logger.js';

const ENDPOINT = 'https://graphql.anilist.co';

export async function paginatedCharacters(perPage = 50, maxPage = 10) {
  const out = [];
  for (let page = 1; page <= maxPage; page++) {
    logger.info(`Fetching page ${page}`);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DOSSO/1.0 (https://github.com/Puff1235666g/Dosso-)'
      },
      body: JSON.stringify({
        query: `
          query($page:Int,$perPage:Int){
            Page(page:$page,perPage:$perPage){
              characters(sort:FAVOURITES_DESC){
                id
                name{first last full native alternative}
                image{large medium}
                description
                gender
                dateOfBirth{year month day}
                age
                bloodType
                favourites
                media(type:ANIME,nodes:true){
                  id
                  title{romaji english native}
                }
              }
            }
          }`,
        variables: { page, perPage }
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const chars = json.data.Page.characters;
    if (!chars.length) break;
    out.push(...chars);
  }
  return out;
}
