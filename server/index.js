const keys = require( './keys.js');
const redis = require( 'redis');

const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyparser.json());


const { Pool,Client } = require('pg');

const connectionString = 'postgresql://postgres:example@postgres_db:5432/postgres'
const pgClient = new Pool({
    connectionString: connectionString,
  });
  pgClient.connect((err, client, release) => {
    if (err) {
      return console.log('Error acquiring client', err.stack)
    }
    client.query('SELECT NOW()', (err, result) => {
          release();
          if (err) {
              return console.error('Error executing query', err.stack);
          }
          console.log(result.rows);
      })
  });

pgClient.on('error', () => console.log('Lost PG connection'));
pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));


const client = redis.createClient({
    host : keys.redisHost,
    port : keys.redisPort,
    retry_strategy : () => 1000
});

const publisher = client.duplicate();

app.get('/', (req,res) =>{
    res.send('OK');
});

app.get('/values/all', async (req, res) => {
    try {
        console.log(req.url);
        const values = await pgClient.query('SELECT * from values');
        console.log(values);
        res.send(values.rows);
    } catch(err) {
        console.log(err)
    }
});

app.get('/values/current' , async (req, res) => {
    client.hgetall('values' , (err, values) => {
        res.send(values);
    });
});

app.post('/values', (req,res) =>{
    const index = req.body.index;
    if(parseInt(index) > 10) {
       return res.status(422).send('Index is too high');
    }
    try {
    
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    client.hset('values' , index, 'Nothing yet');
    publisher.publish('insert', index);
    res.send({working : true});
    } catch (err) {
        console.log(err);
    }
});

app.listen(5000, () =>{
    console.log("started the application");
});