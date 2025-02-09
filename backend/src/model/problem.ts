import mongoose from "mongoose";

const Problem = mongoose.model("Problem", new mongoose.Schema({
    code: String,
    status: { type: String, default: "pending" },
    output: String,
    problemId: String
}))

export default Problem