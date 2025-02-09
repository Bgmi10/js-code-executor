import { Redis } from "ioredis";
import dotenv from "dotenv";
import { Worker } from "bullmq";
import { VM } from "vm2";
dotenv.config({ path: "../.env"});
import mongoose from "mongoose";
import Problem from "./model/Problem";

const redisHost = process.env.REDIS_HOST as string;
const redisPort = process.env.REDIS_PORT as any;
const mongouri = process.env.MONGO_URI as string;

async function connectDb () {
    await mongoose.connect(mongouri).then(() => console.log("connected db success")).catch(e => console.log(e)); 
}

connectDb();

const redis = new Redis({ host: redisHost, port: redisPort, maxRetriesPerRequest: null});
const worker = new Worker("codeQueue", async (job) =>{
   console.log("started the processing");
   const { id, code } = job.data;
   let output;

   try {
    const vm = new VM({ timeout: 2000 });
    output = vm.run(code);
    console.log(output)
   } catch (err: any) {
    output = `Error: ${err.message}`;
   }

  await Problem.findByIdAndUpdate(id, { status: "completed", output });

  console.log("✅ Job completed:", id);
   
}, { connection: redis });

worker.on("error", (error) => console.log(error));
