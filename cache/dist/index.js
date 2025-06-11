"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
// import { config } from 'dotenv'
const redisclient = (0, redis_1.createClient)({
    url: 'redis://localhost:6379'
});
redisclient.connect().catch(console.error);
redisclient.on('error', (err) => {
    console.log(err + ' redis client error');
});
redisclient.on('connect', () => {
    console.log("redis client connected");
});
