import db from '../lib/db.js';
import { paginatedCharacters } from '../lib/anilist.js';
import logger from '../lib/logger.js';

const insert = db.prepare(`
INSERT OR REPLACE INTO characters
(id,name,name_alt,image_large,image_medium,description,gender,dateOfBirth,age,blood_type,favorites,series)
VALUES (@id,@name,@name_alt,@image_large,@image_medium,@description,@gender,@dateOfBirth,@age,@blood_type,@favorites,@series)
`);

export default async function syncCharacters() {
  logger.info('Début synchronisation');
  const chars = await paginatedCharacters(50, 20); // 1 000 persos
  const mapped = chars.map(c => ({
    id: c.id,
    name: c.name.full || c.name.first + ' ' + (c.name.last || ''),
    name_alt: JSON.stringify(c.name.alternative),
    image_large: c.image.large,
    image_medium: c.image.medium,
    description: c.description || '',
    gender: c.gender || '',
    dateOfBirth: JSON.stringify(c.dateOfBirth),
    age: c.age,
    blood_type: c.bloodType,
    favorites: c.favourites,
    series: JSON.stringify(c.media.nodes.map(m => ({ id: m.id, title: m.title.romaji || m.title.english })))
  }));

  const insertMany = db.transaction((rows) => {
    for (const r of rows) insert.run(r);
  });
  insertMany(mapped);
  logger.info(`${mapped.length} personnages insérés/maj`);
}
