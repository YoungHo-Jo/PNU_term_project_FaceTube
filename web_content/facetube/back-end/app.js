const express = require('express')
const mysql = require('mysql')
const dbConfig = require('./config/db.json')
const socketIO = require('socket.io')
const telegraf = require('telegraf')

const app = express()
const port = process.env.PORT || 5555
const server = app.listen(port, () => {
    console.log(`Express listening on port ${port}`)
})
const io = socketIO.listen(server)
const bot = new telegraf('523293033:AAErQYi2RaX7ggFZu8fIVMlgjCY_-WmgfAw')
bot.startPolling()


let dbConn = mysql.createConnection(dbConfig)

let getSeconds = (day = 0, minute = 0, second = 0) =>  {
    day = Number(day)
    minute = Number(minute)
    second = Number(second)
    return day*24*60*60 + minute*60 + second
}

let getBackwardTimeInFormat = (day = 0, minute = 0, second = 0) => {
    console.log(`day: ${day} minute: ${minute} second: ${second}`)
    let backwardSeconds = Math.floor(Date.now()/1000) - getSeconds(day, minute, second) + 9*60*60
    
    let timeInFormat = new Date(backwardSeconds*1000).toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '')


    console.log(timeInFormat)
    return timeInFormat
}

app.get('/face/all/:day?:minute?:second?', (req, res) => {
    let day = req.query.day
    let minute = req.query.minute
    let second = req.query.second

    if(!(day || minute || second)) {
        day = 100
    }

    let timeInFormat = getBackwardTimeInFormat(day, minute, second)
    dbConn.query(`SELECT * FROM face WHERE time >= '${timeInFormat}'`, (err, rows) => {
        if(err) throw err
        res.send(rows)
    })
})

app.get('/face/expression/most/:day?:minute?:second?', (req, res) => {
    let day = req.query.day
    let minute = req.query.minute
    let second = req.query.second

    if(!(day || minute || second)) {
        day = 100
    }

    let timeInFormat = getBackwardTimeInFormat(day, minute, second)
    dbConn.query(`SELECT expression, COUNT(expression) as total FROM face 
        WHERE time >= '${timeInFormat}' 
        GROUP BY expression
        ORDER BY total DESC`, (err, rows) => {
        if(err) throw err

        res.send(rows)
    })
})

app.post('/youtube/next', (req, res) => {
    console.log(`[POST] /youtube/next`)
    io.sockets.emit('youtube', 'next') 
    res.status(200).send()
})


io.on('connection', socket => {
    console.log('Client connected')

    socket.on('disconnect', () => {
        console.log('Client disconnected')
    })

    // socket.on('test', hi => {
    //     console.log('from client ', hi)
        
    //     io.sockets.emit('test', 'hello')
    // })

    socket.on('expression change', (expression) => {
        if(recentBotClient) {
            recentBotClient.reply(expression)
        } else {
            console.log('Bot chat id is undefined')
        }
    })
})

let recentBotClient = null
bot.start(ctx => {
    ctx.reply('Welcome!')
    recentBotClient = ctx
})

