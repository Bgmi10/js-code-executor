import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Redis } from "ioredis";
dotenv.config({ path: "../.env"});
import Problem from "./model/problem";
import bodyParser from "body-parser";
import { Queue } from "bullmq";
import cors from "cors";

const PORT = process.env.PORT;
const uri = process.env.MONGO_URI as string;
const redisHost = process.env.REDIS_HOST as string;
const redisPort = process.env.REDIS_PORT as any;

async function connectDb() {
await mongoose.connect(uri).then(res => console.log("connected db success")).catch(e => console.log(e));
}

connectDb()
const redis = new Redis({ host: redisHost, port: redisPort });
const codeQueue = new Queue("codeQueue", { connection: redis });

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200).json({ message: "hello server" });
});

app.post("/api/submit-problem", async(req, res) => {
    const { code } = req.body;

    if (!code) {
        res.status(400).json({ message: "Invalid request" });
        return;
    }

    const problem = await Problem.create({ 
        code: code,
    });

    await codeQueue.add("execute", { id: problem._id, code: problem.code })
    .then(res => console.log(res))
    .catch(e => console.log(e))

    res.status(200).json({ message: "problem saved", problemId: problem._id });
});

app.post("/api/check", async(req, res) => {
   const { problemId } = req.body;
   
   if (!problemId) {
    res.status(400).json({ message: "invalid problem Id" });
   }

   try{
    const data = await Problem.findById(problemId);
    res.status(200).json({ message: "success", result: data }) 
   } catch (e) {
    console.log(e);
   }
})

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})