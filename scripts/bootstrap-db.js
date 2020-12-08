/* idempotent operation to bootstrap database */
const faunadb = require('faunadb');
const chalk = require('chalk');

const q = faunadb.query;

/*  */
function setupFaunaDB() {
  console.log(chalk.yellow('Attempting to create the DB schemas...'));

  let key = checkForFaunaKey();

  const client = new faunadb.Client({
    secret: key,
  });

  /* Based on your requirements, change the schema here */
  return client
    .query(
      q.CreateCollection({
        name: 'character_lists',
      }),
    )
    .then(() =>
      client.query(
        q.Do(
          q.CreateIndex({
            name: 'all_character_lists_by_id',
            source: q.Collection('character_lists'),
            terms: [
              {
                field: ['data', 'id'],
              },
            ],
            unique: true,
          }),
        ),
      ),
    )
    .catch(e => {
      if (e.message === 'instance already exists') {
        console.log('Schemas are already created... skipping');
        process.exit(0);
      } else {
        console.error('There was a problem bootstrapping the db', e);
        throw e;
      }
    });
}

function checkForFaunaKey() {
  if (!process.env.FAUNADB_SERVER_SECRET) {
    console.log(
      chalk.bold.red(
        "Required 'FAUNADB_SERVER_SECRET' environment variable not found.",
      ),
    );
    console.log(
      chalk.yellow.bold(`
    ~~~~~~~~~~~~~~~~~~~~~~~~~
    You can create a your fauna db server secret by following this:
      - https://docs.fauna.com/fauna/current/tutorials/authentication/user.html#setup-server-key
    
    Then ensure you have added the server secret into your Netlify site as an environment variable 
    with the key 'FAUNADB_SERVER_SECRET'.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~
      `),
    );
    process.exit(1);
  }

  console.log(
    chalk.green(
      `Found FAUNADB_SERVER_SECRET environment variable in Netlify site`,
    ),
  );
  return process.env.FAUNADB_SERVER_SECRET;
}

setupFaunaDB()
  .then(() => {
    console.log(chalk.green(`Bootstraping DB schemas was successful!`));
  })
  .catch(err => {
    console.log(
      chalk.red.bold(
        `There was an issue bootstrapping the DB scheamas due to: ${err}`,
      ),
    );
    process.exit(1);
  });
