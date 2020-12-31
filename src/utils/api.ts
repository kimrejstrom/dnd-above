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

const publicReadById = (listId: string, characterId: string) => {
  return fetch(
    `/.netlify/functions/character-list-public-read-id/${listId}/${characterId}`,
    {
      method: 'GET',
    },
  );
};

const DnDAboveAPI = {
  create: create,
  readAll: readAll,
  update: update,
  publicReadById: publicReadById,
};

export default DnDAboveAPI;
