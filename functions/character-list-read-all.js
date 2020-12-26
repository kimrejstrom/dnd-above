import faunadb from 'faunadb';
import { faunaErrorHandler } from './utils/FaunaErrorHandler';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async (event, context) => {
  console.log('Function `character-list-read-all` invoked');

  // Make sure user has valid token
  const claims = context.clientContext && context.clientContext.user;
  if (!claims) {
    return {
      statusCode: 401,
      body: 'You must be signed in to call this function',
    };
  }

  try {
    const response = await client.query(
      q.Get(q.Match(q.Index('all_character_lists_by_id'), claims.email)),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return faunaErrorHandler(error);
  }
};
