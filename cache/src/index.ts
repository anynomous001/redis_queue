import express from 'express'
import axios from 'axios'
import { createClient } from 'redis'
// import { config } from 'dotenv'


const redisclient = createClient({
    url: 'redis://localhost:6379'
})

redisclient.connect().catch(console.error)

redisclient.on('error', (err) => {
    console.log(err + ' redis client error')
})

redisclient.on('connect', () => {
    console.log("redis client connected")
})

const app = express()

app.use(express.json())

const


    app.get('/home', (req, res) => {




        res.json({
            message: "welcome to home page"
        })
    })


app.listen(3000, () => {
    console.log("server is running on port 3000")
})