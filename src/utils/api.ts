import { CharacterList } from 'features/character/characterListSlice';
import netlifyIdentity from 'netlify-identity-widget';

/* Api methods to call /functions */

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (netlifyIdentity.currentUser()) {
    return {
      ...headers,
      Authorization: `Bearer ${
        netlifyIdentity.currentUser()?.token?.access_token
      }`,
    };
  }
};

const create = (data: CharacterList) => {
  return fetch('/.netlify/functions/character-list-create', {
    body: JSON.stringify(data),
    method: 'POST',
    headers: getHeaders(),
  });
};

const readAll = () => {
  return fetch('/.netlify/functions/character-list-read-all', {
    method: 'GET',
    headers: getHeaders(),
  });
};

const update = (data: CharacterList) => {
  return fetch(`/.netlify/functions/character-list-update/${data.id}`, {
    body: JSON.stringify(data),
    method: 'POST',
    headers: getHeaders(),
  });
};

// const deleteCharacters = characterId => {
//   return fetch(`/.netlify/functions/characters-delete/${characterId}`, {
//     method: 'POST',
//     headers: getHeaders(),
//   }).then(response => {
//     return response.json();
//   });
// };

// const batchDeleteCharacters = characterIds => {
//   return fetch(`/.netlify/functions/characters-delete-batch`, {
//     body: JSON.stringify({
//       ids: characterIds,
//     }),
//     method: 'POST',
//     headers: getHeaders(),
//   }).then(response => {
//     return response.json();
//   });
// };

export default {
  create: create,
  readAll: readAll,
  update: update,
  // delete: deleteCharacters,
  // batchDelete: batchDeleteCharacters,
};
