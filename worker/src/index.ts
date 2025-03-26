import { createClient } from "redis"

const client = createClient();

async function processSubmission(submission: any) {
    const { problemId, language, code } = JSON.parse(submission);

    console.log(`Processing submission for problemId ${problemId}...`);
    console.log(`Code: ${code}`);
    console.log(`Language: ${language}`);
    // Here you would add your actual processing logic

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Finished processing submission for problemId ${problemId}.`);
    client.publish("problem_status", { problemId, status: "processed" });

}

async function startWorker() {
    await client.connect();
    console.log("Connected to Redis");

    while (true) {
        const submissions = await client.brPop("submissions", 0);
        //@ts-ignore
        await processSubmission(submissions.element);
    }

}
startWorker();





