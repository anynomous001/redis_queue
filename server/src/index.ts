import express from "express";
import { createClient } from "redis";

const app = express();
const client = createClient();
client.on('error', (err) => console.log('Redis Client Error', err));

app.use(express.json());

app.post("/", async (req, res) => {
    const { problemId } = req.body;
    const { language } = req.body;
    const { code } = req.body;


    try {
        const submission = await client.lPush("submissions", JSON.stringify({ language, problemId, code }));
        res.status(200).json({ submission });
        console.log("Submission added to Redis");
    } catch (error) {
        res.status(500).json({ error: "Failed to submit code" });
        console.error(error);
    }

});

async function startServer() {

    try {
        await client.connect();
        console.log("Connected to Redis");
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error(error);

    }
}

startServer();