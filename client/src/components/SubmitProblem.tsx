"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function CodeExecutor() {
  const [code, setCode] = useState(`// Write your JavaScript code here
// Example API call:
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`)

  const [output, setOutput] = useState("")
  const [problemId, setProblemId] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const baseurl = "http://localhost:5000"

  const executeCode = async () => {
    setOutput("Executing...\n")
    setIsExecuting(true)

    try {
        if (!code) return;
      const response = await axios.post(baseurl + "/api/submit-problem", { code })
      console.log(response.data)

      if (response.data.problemId) {
        setProblemId(response.data.problemId)
      }
    } catch (error) {
      setOutput((prev) => prev + `Error: ${error}\n`)
      setIsExecuting(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (problemId) {
      interval = setInterval(async () => {
        try {
          const response = await axios.post(baseurl + "/api/check", { problemId })
          if (response.data.result) {
            setOutput(response.data.result.output || "Execution Complete.")
            setProblemId(null)
            setIsExecuting(false)
            clearInterval(interval)
          }
        } catch (error) {
          console.log("Polling error:", error)
        }
      }, 2000)
    }

    return () => clearInterval(interval)
  }, [problemId])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800"> JS Code Executor</h1>

      <div className="mb-6 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-700">
          <span className="text-sm font-semibold text-gray-200">JavaScript</span>
          <span className="text-sm text-gray-400">editor</span>
        </div>
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-80 p-4 text-sm font-mono bg-gray-800 text-gray-200 resize-none focus:outline-none"
            placeholder="Write your JavaScript code here..."
            spellCheck="false"
          />
          <pre className="absolute top-0 left-0 w-8 h-full flex flex-col items-end pr-2 pt-4 pb-4 text-sm font-mono text-gray-500 bg-gray-900 select-none">
            {code.split("\n").map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </pre>
        </div>
      </div>

      <button
        onClick={executeCode}
        disabled={isExecuting}
        className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
          isExecuting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isExecuting ? "Executing..." : "Run Code"}
      </button>

      <div className="mt-6 bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="px-4 py-2 bg-gray-100 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Output</h2>
        </div>
        <pre className="p-4 text-sm font-mono text-gray-700 whitespace-pre-wrap break-words min-h-[100px] max-h-[300px] overflow-y-auto">
          {output || "Your code output will appear here..."}
        </pre>
      </div>
    </div>
  )
}

