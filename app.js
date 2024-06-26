const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())
const path = require('path')

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is up and running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//API-1
//get list of all the players
app.get('/players/', async (request, response) => {
  const q = `
    select player_id as playerId,player_name as playerName from
    player_details
    `
  const dbval = await db.all(q)
  response.send(dbval)
})

//API-2
//get player details using player_id
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const q = `
    select player_id as playerId,player_name as playerName from
    player_details where player_id = ${playerId};
    `
  const dbval = await db.get(q)
  response.send(dbval)
})

//API-3
//updating a player details
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const given = request.body
  const {playerName} = given
  const q = `
    update player_details set player_name = '${playerName}' where 
    player_id = ${playerId};
    `
  await db.run(q)
  response.send('Player Details Updated')
})

//API-4
//get details of a specific match
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const q = `
    select match_id as matchId,match,year from
    match_details where match_id = ${matchId};
    `
  const dbval = await db.get(q)
  response.send(dbval)
})

//API-5
//returning list of all matches played by a player using playerId
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const q = `
    select match_details.match_id as matchId,match_details.match as match,match_details.year as year
    from player_match_score inner join match_details on player_match_score.match_id=match_details.match_id
    where player_match_score.player_id = ${playerId};
    `
  const dbval = await db.all(q)
  response.send(dbval)
})

//API-6
//all players of a match
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const q = `
    select player_details.player_id as playerId,player_details.player_name as playerName
    from player_match_score inner join player_details 
    on player_match_score.player_id=player_details.player_id
    where player_match_score.match_id = ${matchId};
    `
  const dbval = await db.all(q)
  response.send(dbval)
})

//API-7
//getting stats of a player
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const q = `
    select player_details.player_id as playerId ,player_details.player_name as playerName,
    sum(player_match_score.score) as totalScore,sum(player_match_score.fours) as totalFours, sum(player_match_score.sixes) as totalSixes
    from player_match_score inner join player_details
    on player_match_score.player_id =  player_details.player_id
    where player_match_score.player_id = ${playerId};
    `
  const dbval = await db.get(q)
  response.send(dbval)
})

module.exports = app
