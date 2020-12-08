import faunadb from 'faunadb';
import { faunaErrorHandler } from './utils/FaunaErrorHandler';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async (event, context) => {
  /* parse the string body into a useable JS object */
  const data = JSON.parse(event.body);
  console.log(
    `Function 'character-list-update' invoked. update id: ${data.id}`,
    data,
  );

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
    },
  };

  try {
    const response = await client.query(
      q.Replace(q.Ref(`classes/character_lists/${data.id}`), characterListData),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return faunaErrorHandler(error);
  }
};
