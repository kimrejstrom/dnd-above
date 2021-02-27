import faunadb from 'faunadb';
import { faunaErrorHandler } from './utils/FaunaErrorHandler';

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

/* export our lambda function as named "handler" export */
exports.handler = async (event, context) => {
  /* parse the string body into a useable JS object */
  const data = JSON.parse(event.body);
  console.log('Function `character-list-create` invoked', data);

  // Make sure user has valid token
  const claims = context.clientContext && context.clientContext.user;
  if (!claims) {
    return {
      statusCode: 401,
      body: 'You must be signed in to call this function',
    };
  }

  const characterListData = {
    data: {
      list: data.list,
      id: claims.email,
      updatedAt: data.updatedAt,
    },
  };

  try {
    const response = await client.query(
      q.Create(q.Ref('classes/character_lists'), characterListData),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return faunaErrorHandler(error);
  }
};
