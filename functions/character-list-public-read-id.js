import faunadb from 'faunadb';
import { faunaErrorHandler } from './utils/FaunaErrorHandler';
import { parseURL } from './utils/urlParams';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async (event, context) => {
  console.log('Function `character-list-public-read-id` invoked');
  const pathVariables = parseURL(event.path);

  try {
    const response = await client.query(
      q.Get(q.Ref(`classes/character_lists/${pathVariables[2]}`)),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...response,
        data: {
          ...response.data,
          list: response.data.list.filter(item => item.id === pathVariables[3]),
        },
      }),
    };
  } catch (error) {
    return faunaErrorHandler(error);
  }
};
