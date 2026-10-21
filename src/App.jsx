import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { EditorView } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import {
  Activity,
  ArrowDown,
  ArrowRight,
  AlertTriangle,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Code2,
  Command,
  Cpu,
  FileCode2,
  Crosshair,
  GitBranch,
  Layers3,
  Menu,
  Network,
  Play,
  RotateCcw,
  ShieldCheck,
  SquareTerminal,
  Terminal,
  Trash2,
  X,
  Zap,
} from 'lucide-react'

const languages = [
  {
    id: 'javascript',
    label: 'JavaScript',
    file: 'main.js',
    compiler: 'nodejs-20.17.0',
    loadExtension: () => Promise.resolve(javascriptExtension),
    starter: `// JavaScript runs locally in a Web Worker.
const scores = [82, 94, 76, 99]
const average = scores.reduce((sum, score) => sum + score, 0) / scores.length

console.log("Average score:", average)
console.table(scores)`,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    file: 'main.ts',
    compiler: 'typescript-5.6.2',
    loadExtension: async () => javascript({ typescript: true }),
    starter: `type User = { name: string; active: boolean }

const users: User[] = [
  { name: "Ada", active: true },
  { name: "Grace", active: false },
]

console.log(users.filter((user) => user.active))`,
  },
  {
    id: 'python',
    label: 'Python',
    file: 'main.py',
    compiler: 'cpython-3.13.8',
    loadExtension: async () => (await import('@codemirror/lang-python')).python(),
    starter: `# Python runs on the remote Wandbox compiler.
scores = [82, 94, 76, 99]
average = sum(scores) / len(scores)

print(f"Average score: {average:.1f}")
print([score for score in scores if score >= 90])`,
  },
  {
    id: 'c',
    label: 'C',
    file: 'main.c',
    compiler: 'gcc-13.2.0-c',
    loadExtension: async () => (await import('@codemirror/lang-cpp')).cpp(),
    starter: `#include <stdio.h>

int main(void) {
    int scores[] = {82, 94, 76, 99};
    int count = sizeof(scores) / sizeof(scores[0]);
    printf("Scores: %d\\n", count);
    return 0;
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    file: 'main.cpp',
    compiler: 'gcc-13.2.0',
    loadExtension: async () => (await import('@codemirror/lang-cpp')).cpp(),
    starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores{82, 94, 76, 99};
    for (const auto score : scores) {
        std::cout << score << " ";
    }
}`,
  },
  {
    id: 'java',
    label: 'Java',
    file: 'Main.java',
    compiler: 'openjdk-jdk-21+35',
    loadExtension: async () => (await import('@codemirror/lang-java')).java(),
    starter: `public class prog {
    public static void main(String[] args) {
        int[] scores = {82, 94, 76, 99};
        for (int score : scores) {
            System.out.println(score);
        }
    }
}`,
  },
  {
    id: 'csharp',
    label: 'C#',
    file: 'main.cs',
    compiler: 'mono-6.12.0.199',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/clike')).csharp),
    starter: `using System;

class Program {
    static void Main() {
        int[] scores = { 82, 94, 76, 99 };
        Console.WriteLine(string.Join(", ", scores));
    }
}`,
  },
  {
    id: 'go',
    label: 'Go',
    file: 'main.go',
    compiler: 'go-1.23.2',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/go')).go),
    starter: `package main

import "fmt"

func main() {
    scores := []int{82, 94, 76, 99}
    fmt.Println("Scores:", scores)
}`,
  },
  {
    id: 'rust',
    label: 'Rust',
    file: 'main.rs',
    compiler: 'rust-1.82.0',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/rust')).rust),
    starter: `fn main() {
    let scores = [82, 94, 76, 99];
    println!("Scores: {:?}", scores);
}`,
  },
  {
    id: 'ruby',
    label: 'Ruby',
    file: 'main.rb',
    compiler: 'ruby-3.4.9',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/ruby')).ruby),
    starter: `scores = [82, 94, 76, 99]
average = scores.sum.to_f / scores.length

puts "Average score: #{average.round(1)}"
puts scores.select { |score| score >= 90 }`,
  },
  {
    id: 'php',
    label: 'PHP',
    file: 'main.php',
    compiler: 'php-8.3.12',
    loadExtension: async () => (await import('@codemirror/lang-php')).php(),
    starter: `<?php
$scores = [82, 94, 76, 99];
$average = array_sum($scores) / count($scores);

echo "Average score: " . $average . PHP_EOL;
print_r(array_filter($scores, fn($score) => $score >= 90));`,
  },
  {
    id: 'bash',
    label: 'Bash',
    file: 'main.sh',
    compiler: 'bash',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/shell')).shell),
    starter: `#!/usr/bin/env bash
scores=(82 94 76 99)

for score in "\${scores[@]}"; do
  echo "Score: $score"
done`,
  },
  {
    id: 'sql',
    label: 'SQL',
    file: 'main.sql',
    compiler: 'sqlite-3.46.1',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/sql')).sqlite),
    starter: `CREATE TABLE scores (name TEXT, score INTEGER);
INSERT INTO scores VALUES ('Ada', 94), ('Grace', 99);

SELECT name, score
FROM scores
WHERE score >= 90
ORDER BY score DESC;`,
  },
  {
    id: 'r',
    label: 'R',
    file: 'main.R',
    compiler: 'r-4.4.1',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/r')).r),
    starter: `scores <- c(82, 94, 76, 99)
average <- mean(scores)

cat("Average score:", average, "\\n")
print(scores[scores >= 90])`,
  },
  {
    id: 'julia',
    label: 'Julia',
    file: 'main.jl',
    compiler: 'julia-1.10.5',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/julia')).julia),
    starter: `scores = [82, 94, 76, 99]
average = sum(scores) / length(scores)

println("Average score: $average")
println(filter(score -> score >= 90, scores))`,
  },
  {
    id: 'haskell',
    label: 'Haskell',
    file: 'main.hs',
    compiler: 'ghc-9.10.1',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/haskell')).haskell),
    starter: `scores :: [Int]
scores = [82, 94, 76, 99]

main :: IO ()
main = print (filter (>= 90) scores)`,
  },
  {
    id: 'scala',
    label: 'Scala',
    file: 'main.scala',
    compiler: 'scala-3.3.4',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/clike')).scala),
    starter: `object Main {
  def main(args: Array[String]): Unit = {
    val scores = List(82, 94, 76, 99)
    println(scores.filter(_ >= 90))
  }
}`,
  },
  {
    id: 'lua',
    label: 'Lua',
    file: 'main.lua',
    compiler: 'lua-5.4.7',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/lua')).lua),
    starter: `local scores = {82, 94, 76, 99}

for _, score in ipairs(scores) do
  if score >= 90 then print(score) end
end`,
  },
  {
    id: 'perl',
    label: 'Perl',
    file: 'main.pl',
    compiler: 'perl-5.44.0',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/perl')).perl),
    starter: `my @scores = (82, 94, 76, 99);
my @high_scores = grep { $_ >= 90 } @scores;

print "High scores: @high_scores\\n";`,
  },
  {
    id: 'pascal',
    label: 'Pascal',
    file: 'main.pas',
    compiler: 'fpc-3.2.2',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/pascal')).pascal),
    starter: `program Scores;
begin
  writeln('Hello from Pascal');
end.`,
  },
  {
    id: 'groovy',
    label: 'Groovy',
    file: 'main.groovy',
    compiler: 'groovy-4.0.23',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/groovy')).groovy),
    starter: `def scores = [82, 94, 76, 99]
def highScores = scores.findAll { it >= 90 }

println "High scores: $highScores"`,
  },
  {
    id: 'd',
    label: 'D',
    file: 'main.d',
    compiler: 'dmd-2.109.1',
    loadExtension: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/d')).d),
    starter: `import std.stdio;

void main() {
    writeln("Hello from D");
}`,
  },
  {
    id: 'html',
    label: 'HTML + CSS',
    file: 'index.html',
    loadExtension: async () => (await import('@codemirror/lang-html')).html(),
    starter: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Hello, browser</title>
    <style>
      body { font: 18px system-ui; padding: 2rem; color: #24322a; }
      h1 { color: #516b37; }
    </style>
  </head>
  <body>
    <h1>Hello, browser!</h1>
    <p>Edit this page, then press Run to preview it.</p>
  </body>
</html>`,
  },
]

const starterCode = languages[0].starter
const javascriptExtension = javascript()

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    color: '#e2e8f0',
    backgroundColor: '#0b1020',
    fontSize: '14px',
  },
  '.cm-scroller': { overflow: 'auto', fontFamily: '"Cascadia Code", "JetBrains Mono", Consolas, monospace', fontSize: '14px', lineHeight: '1.65' },
  '.cm-content': { padding: '18px 0', caretColor: '#e6a078' },
  '.cm-line': { padding: '0 18px' },
  '.cm-gutters': { border: 'none', backgroundColor: '#0b1020', color: '#64748b' },
  '.cm-activeLine': { backgroundColor: 'rgba(226, 232, 240, 0.045)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(226, 232, 240, 0.045)', color: '#aab7c8' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#e6a078' },
  '&.cm-focused': { outline: 'none' },
}, { dark: true })

const editorHighlighting = HighlightStyle.define([
  { tag: tags.keyword, color: '#e6a078' },
  { tag: tags.string, color: '#b6c2a6' },
  { tag: tags.number, color: '#d7bd91' },
  { tag: tags.comment, color: '#718096', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#a8bddb' },
  { tag: tags.typeName, color: '#9dbbb4' },
  { tag: tags.operator, color: '#bac4d1' },
  { tag: tags.variableName, color: '#e2e8f0' },
])
const editorSyntax = syntaxHighlighting(editorHighlighting)

const workerSource = `
const format = (value) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'undefined') return 'undefined';
  try {
    const json = JSON.stringify(value, null, 2);
    return json === undefined ? String(value) : json;
  } catch {
    return String(value);
  }
};

self.onmessage = async ({ data }) => {
  const startedAt = performance.now();
  const entries = [];
  const addEntry = (type, args) => entries.push({
    type,
    text: args.map(format).join(' '),
  });
  const sandboxConsole = {
    log: (...args) => addEntry('log', args),
    info: (...args) => addEntry('info', args),
    warn: (...args) => addEntry('warn', args),
    error: (...args) => addEntry('error', args),
    table: (value) => addEntry('log', [value]),
    clear: () => { entries.length = 0; },
  };

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const program = new AsyncFunction('console', '"use strict";\\n' + data.code);
    await program(sandboxConsole);
    self.postMessage({
      type: 'execution-result',
      result: {
        entries,
        duration: performance.now() - startedAt,
        error: null,
      },
    });
  } catch (error) {
    self.postMessage({
      type: 'execution-result',
      result: {
        entries,
        duration: performance.now() - startedAt,
        error: error instanceof Error ? \`\${error.name}: \${error.message}\` : String(error),
      },
    });
  }
};
`

const features = [
  {
    number: '01',
    icon: Layers3,
    title: 'Build the interface first.',
    description:
      'React components, layout, and interaction states in the part of the product customers actually touch.',
    tags: ['React', 'CSS', 'Accessibility'],
    accent: 'blue',
  },
  {
    number: '02',
    icon: Network,
    title: 'Connect the parts.',
    description:
      'Wire model and product APIs into a real interface, with loading, failure, and empty states handled up front.',
    tags: ['APIs', 'FastAPI', 'Error states'],
    accent: 'orange',
  },
  {
    number: '03',
    icon: Crosshair,
    title: 'Make the messy code legible.',
    description:
      'Refactor tangled generated output into smaller pieces you can read, test, and change without guessing.',
    tags: ['Refactoring', 'Tests', 'Review'],
    accent: 'ink',
  },
]

const telemetry = [
  { label: 'Languages in the menu', value: '23', change: 'Including HTML + CSS', icon: Braces },
  { label: 'Local code paths', value: '2', change: 'JavaScript worker + HTML preview', icon: Code2 },
  { label: 'Sent to Wandbox on Run', value: '21', change: 'Remote compiler; source leaves your browser', icon: Network },
  { label: 'AI code analysis', value: 'None', change: 'Static checks use ESLint and Ruff instead', icon: ShieldCheck },
]

const architecture = [
  {
    label: 'Interface',
    title: 'React + CodeMirror',
    icon: Code2,
    description: 'One Vite app. CodeMirror 6 handles editing, language modes, line numbers, and autocomplete.',
    items: ['React + Vite', 'CodeMirror 6', 'Responsive CSS layout'],
    color: 'violet',
  },
  {
    label: 'Analysis',
    title: 'Static checks, not AI',
    icon: Cpu,
    description: 'There is no model connection or API credential configured. The API runs standard lint rules for JavaScript and Python.',
    items: ['ESLint for JavaScript', 'Ruff for Python', 'Not a security review'],
    color: 'cyan',
  },
  {
    label: 'Execution',
    title: 'Browser + Wandbox',
    icon: Activity,
    description: 'JavaScript runs in a Web Worker. Other supported languages are compiled remotely after you press Run.',
    items: ['Worker has a 2-second limit', 'Remote runs send source to Wandbox', 'HTML preview blocks scripts'],
    color: 'pink',
  },
]

function App() {
  const [languageId, setLanguageId] = useState('javascript')
  const [sourceCode, setSourceCode] = useState(starterCode)
  const [languageExtension, setLanguageExtension] = useState(javascriptExtension)
  const [languageLoadError, setLanguageLoadError] = useState('')
  const [stdin, setStdin] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeOutputTab, setActiveOutputTab] = useState('console')
  const [execution, setExecution] = useState({ status: 'idle', entries: [], duration: null, error: null })
  const [analysis, setAnalysis] = useState({ status: 'idle', diagnostics: [], analyzer: null, error: null, summary: null })
  const [activeNav, setActiveNav] = useState('studio')
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const workerRef = useRef(null)
  const requestRef = useRef(null)
  const analysisRequestRef = useRef(null)
  const outputPaneRef = useRef(null)
  const languageLoadRef = useRef(0)
  const runTimeout = useRef(null)
  const toastTimeout = useRef(null)
  const selectedLanguage = languages.find((item) => item.id === languageId) ?? languages[0]
  const analyzerName = languageId === 'javascript' ? 'ESLint' : languageId === 'python' ? 'Ruff' : null
  const editorExtensions = useMemo(() => [
    ...(languageExtension ? [languageExtension] : []),
    editorSyntax,
    EditorView.lineWrapping,
  ], [languageExtension])

  useEffect(
    () => () => {
      window.clearTimeout(runTimeout.current)
      window.clearTimeout(toastTimeout.current)
      workerRef.current?.terminate()
      requestRef.current?.abort()
      analysisRequestRef.current?.abort()
      languageLoadRef.current += 1
    },
    [],
  )

  useEffect(() => {
    if (
      execution.status !== 'idle'
      && window.matchMedia('(max-width: 859px)').matches
    ) {
      outputPaneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [execution.status])

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(toastTimeout.current)
    toastTimeout.current = window.setTimeout(() => setToast(''), 2600)
  }, [])

  const loadEditorLanguage = useCallback(async (language) => {
    const loadId = ++languageLoadRef.current
    setLanguageLoadError('')
    try {
      const extension = await language.loadExtension()
      if (languageLoadRef.current === loadId) setLanguageExtension(extension)
    } catch (error) {
      if (languageLoadRef.current === loadId) {
        setLanguageLoadError(`Could not load ${language.label} editor support: ${error.message}`)
      }
    }
  }, [])

  const analyzeCode = async () => {
    if (sourceCode.length > 50000) {
      setAnalysis({
        status: 'error',
        diagnostics: [],
        analyzer: null,
        error: 'Analysis is limited to 50 KB of source code.',
        summary: null,
      })
      setActiveOutputTab('analysis')
      return
    }

    const controller = new AbortController()
    analysisRequestRef.current?.abort()
    analysisRequestRef.current = controller
    setAnalysis({ status: 'running', diagnostics: [], analyzer: null, error: null, summary: null })
    setActiveOutputTab('analysis')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ language: languageId, code: sourceCode }),
      })
      const result = await response.json()
      if (!response.ok) {
        const detail = typeof result.detail === 'string' ? result.detail : `Analysis service returned HTTP ${response.status}.`
        throw new Error(detail)
      }

      if (analysisRequestRef.current === controller) {
        setAnalysis({
          status: 'success',
          diagnostics: result.diagnostics,
          analyzer: result.analyzer,
          error: null,
          summary: result.summary,
        })
      }
    } catch (error) {
      if (analysisRequestRef.current === controller && error.name !== 'AbortError') {
        setAnalysis({
          status: 'error',
          diagnostics: [],
          analyzer: null,
          error: `Analysis service error: ${error.message}`,
          summary: null,
        })
      }
    } finally {
      if (analysisRequestRef.current === controller) analysisRequestRef.current = null
    }
  }

  const updateSourceCode = (nextSource) => {
    setSourceCode(nextSource)
    analysisRequestRef.current?.abort()
    analysisRequestRef.current = null
    setAnalysis({ status: 'idle', diagnostics: [], analyzer: null, error: null, summary: null })
  }

  const navigateTo = (section) => {
    setActiveNav(section)
    setMobileMenuOpen(false)
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAppKeyDown = (event) => {
    if (
      (event.ctrlKey || event.metaKey)
      && event.key === 'Enter'
      && event.target.closest?.('.cm-editor')
    ) {
      event.preventDefault()
      document.querySelector('.execute-button')?.click()
    }
  }

  const executeJavaScript = () => {
    let worker
    let workerUrl
    try {
      workerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }))
      worker = new Worker(workerUrl)
    } catch (error) {
      setIsRunning(false)
      setExecution({ status: 'error', entries: [], duration: null, error: `Could not start the JavaScript worker: ${error.message}` })
      return
    } finally {
      if (workerUrl) URL.revokeObjectURL(workerUrl)
    }

    workerRef.current = worker
    worker.onmessage = ({ data }) => {
      if (data?.type !== 'execution-result') return
      worker.terminate()
      workerRef.current = null
      window.clearTimeout(runTimeout.current)
      setIsRunning(false)
      const result = data.result
      setExecution({ status: result.error ? 'error' : 'success', ...result })
      if (result.error) {
        setActiveOutputTab('console')
      }
    }
    worker.onerror = (event) => {
      event.preventDefault()
      worker.terminate()
      workerRef.current = null
      window.clearTimeout(runTimeout.current)
      setIsRunning(false)
      setExecution({ status: 'error', entries: [], duration: null, error: event.message || 'The worker could not run this code.' })
    }
    worker.postMessage({ code: sourceCode })

    runTimeout.current = window.setTimeout(() => {
      worker.terminate()
      workerRef.current = null
      setIsRunning(false)
      setExecution({
        status: 'error',
        entries: [],
        duration: null,
        error: 'Execution stopped after 2 seconds. Check for an infinite loop and try again.',
      })
    }, 2000)
  }

  const executeRemoteCode = async (language) => {
    const controller = new AbortController()
    requestRef.current = controller
    runTimeout.current = window.setTimeout(() => controller.abort(), 60000)

    try {
      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          compiler: language.compiler,
          code: sourceCode,
          stdin,
          options: '',
          'compiler-option-raw': '',
          'runtime-option-raw': '',
          save: false,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || `Compiler service returned HTTP ${response.status}.`)
      }

      const entries = []
      if (result.compiler_output) entries.push({ type: 'info', text: result.compiler_output })
      if (result.compiler_error) entries.push({ type: 'error', text: result.compiler_error })
      if (result.program_output) entries.push({ type: 'log', text: result.program_output })
      if (result.program_error) entries.push({ type: 'error', text: result.program_error })

      const failed = result.status !== '0' || Boolean(result.signal)
      setExecution({
        status: failed ? 'error' : 'success',
        entries,
        duration: null,
        exitCode: result.status,
        signal: result.signal || null,
        error: failed && !entries.length
          ? `Program exited with status ${result.status || 'unknown'}${result.signal ? ` (${result.signal})` : ''}.`
          : null,
      })
    } catch (error) {
      if (requestRef.current === controller) {
        const message = error.name === 'AbortError'
          ? 'The compiler request timed out after 60 seconds. Try again.'
          : `Online compiler error: ${error.message}`
        setExecution({ status: 'error', entries: [], duration: null, error: message })
      }
    } finally {
      if (requestRef.current === controller) {
        window.clearTimeout(runTimeout.current)
        requestRef.current = null
        setIsRunning(false)
      }
    }
  }

  const executeCode = () => {
    if (isRunning) return
    if (sourceCode.length > 50000) {
      showToast('Code is over the 50 KB playground limit.')
      return
    }
    workerRef.current?.terminate()
    requestRef.current?.abort()
    analysisRequestRef.current?.abort()
    window.clearTimeout(runTimeout.current)
    const language = languages.find((item) => item.id === languageId) ?? languages[0]
    setExecution({ status: 'running', entries: [], duration: null, error: null })
    setActiveOutputTab(languageId === 'html' ? 'preview' : 'console')
    setIsRunning(true)

    if (languageId === 'html') {
      setExecution({
        status: 'success',
        entries: [],
        duration: null,
        error: null,
        previewHtml: sourceCode,
      })
      setIsRunning(false)
      return
    }

    if (languageId === 'javascript') executeJavaScript()
    else void executeRemoteCode(language)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode)
      setCopied(true)
      showToast('Editor code copied to clipboard.')
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      showToast('Clipboard access is unavailable in this browser.')
    }
  }

  const resetEditor = () => {
    workerRef.current?.terminate()
    workerRef.current = null
    requestRef.current?.abort()
    requestRef.current = null
    analysisRequestRef.current?.abort()
    analysisRequestRef.current = null
    window.clearTimeout(runTimeout.current)
    setIsRunning(false)
    const language = languages.find((item) => item.id === languageId) ?? languages[0]
    setSourceCode(language.starter)
    setStdin('')
    setExecution({ status: 'idle', entries: [], duration: null, error: null })
    setAnalysis({ status: 'idle', diagnostics: [], analyzer: null, error: null, summary: null })
  }

  const changeLanguage = (nextLanguage) => {
    const language = languages.find((item) => item.id === nextLanguage)
    if (!language) return
    workerRef.current?.terminate()
    requestRef.current?.abort()
    requestRef.current = null
    analysisRequestRef.current?.abort()
    analysisRequestRef.current = null
    window.clearTimeout(runTimeout.current)
    setIsRunning(false)
    setLanguageId(nextLanguage)
    setLanguageExtension(null)
    setLanguageLoadError('')
    setActiveOutputTab(nextLanguage === 'html' ? 'preview' : 'console')
    setSourceCode(language.starter)
    setStdin('')
    setExecution({ status: 'idle', entries: [], duration: null, error: null })
    setAnalysis({ status: 'idle', diagnostics: [], analyzer: null, error: null, summary: null })
    void loadEditorLanguage(language)
  }

  return (
    <div className="app-shell" onKeyDownCapture={handleAppKeyDown}>
      <div className="ambient ambient-purple" aria-hidden="true" />
      <div className="ambient ambient-cyan" aria-hidden="true" />

      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand-lockup" onClick={() => navigateTo('top')} aria-label="Nexara home">
            <span className="brand-mark"><Cpu size={20} strokeWidth={1.8} /></span>
            <span className="brand-name">NEXARA<span className="brand-period">.</span></span>
          </button>

          <nav className={`main-nav ${mobileMenuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
            <button className={activeNav === 'studio' ? 'nav-link active' : 'nav-link'} onClick={() => navigateTo('studio')}>The editor</button>
            <button className={activeNav === 'telemetry' ? 'nav-link active' : 'nav-link'} onClick={() => navigateTo('telemetry')}>What runs where</button>
            <button className={activeNav === 'architecture' ? 'nav-link active' : 'nav-link'} onClick={() => navigateTo('architecture')}>How it is built</button>
          </nav>

          <div className="topbar-actions">
            <div className="cluster-status"><span className="status-dot" /> <span>Playground ready</span></div>
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-section content-width">
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <div className="hero-layout">
            <div className="hero-content">
              <h1>The code runs.<br /><span className="gradient-text">Its limits stay visible.</span></h1>
              <div className="hero-facts" aria-label="Playground facts">
                <div><strong>23</strong><span>languages</span></div>
                <div><strong>2</strong><span>local run paths</span></div>
                <div><strong>21</strong><span>remote compiler targets</span></div>
                <div><strong>0</strong><span>AI reviewers</span></div>
              </div>
              <div className="hero-actions">
                <button className="button-primary" onClick={() => navigateTo('studio')}>
                  Open the editor <ArrowRight size={16} />
                </button>
                <button className="button-quiet" onClick={() => navigateTo('telemetry')}>
                  See execution details <ArrowRight size={15} />
                </button>
              </div>
            </div>
            <aside className="hero-note" aria-label="Playground details">
              <div className="hero-note-top"><span>Run map</span><span>Current build</span></div>
              <div className="hero-note-number">23</div>
              <h2>languages. Three different boundaries.</h2>
              <ul>
                <li><span>01</span> JavaScript runs in your browser.</li>
                <li><span>02</span> Remote runs send source to Wandbox.</li>
                <li><span>03</span> ESLint and Ruff check two languages.</li>
              </ul>
              <a href="#telemetry">Read the execution map <ArrowRight size={14} /></a>
            </aside>
          </div>
          <div className="hero-caption"><span>No hosted-execution claims.</span><span className="caption-line" /><span>No invented AI analysis.</span></div>
          <button className="scroll-cue" onClick={() => navigateTo('studio')} aria-label="Scroll to interactive studio"><ArrowDown size={16} /></button>
        </section>

        <section className="studio-section content-width section-anchor" id="studio">
          <div className="section-heading">
            <div>
              <h2>One editor. <span className="gradient-text">Different run paths.</span></h2>
            </div>
            <div className="workspace-label"><span className="live-dot" /> {languageId === 'javascript' || languageId === 'html' ? 'Runs in browser' : 'Wandbox compiler'} <ChevronDown size={14} /></div>
          </div>

          <div className="workspace glass-panel">
            <div className="workspace-topline">
              <div className="window-controls"><i /><i /><i /></div>
            <div className="workspace-path"><span>playground</span><span className="path-slash">/</span><strong>{selectedLanguage.file}</strong><span className="unsaved-dot" /></div>
            <div className="workspace-top-right"><span><CircleDot size={12} /> {languageId === 'javascript' || languageId === 'html' ? 'Local' : 'Wandbox'}</span><span className="topline-separator" /><span>UTF-8</span></div>
            </div>

            <div className="editor-grid">
              <div className="editor-pane source-pane">
                <div className="pane-heading">
                <div className="pane-title"><FileCode2 size={14} /><span>{selectedLanguage.file}</span></div>
                  <div className="editor-pane-actions">
                  <label className="language-select-wrap">
                    <span className="sr-only">Programming language</span>
                    <select aria-label="Programming language" className="language-select" value={languageId} onChange={(event) => changeLanguage(event.target.value)}>
                      {languages.map((language) => <option value={language.id} key={language.id}>{language.label}</option>)}
                    </select>
                    <ChevronDown size={13} />
                  </label>
                  <button className="editor-icon-button" onClick={resetEditor} aria-label="Reset editor to starter code" title="Reset starter code"><RotateCcw size={13} /></button>
                  <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={copyCode} title="Copy editor code">
                    {copied ? <Check size={13} /> : <FileCode2 size={13} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="code-editor codemirror-host">
                  <CodeMirror
                    aria-label={`${selectedLanguage.label} code editor`}
                    value={sourceCode}
                    height="100%"
                    theme={editorTheme}
                    extensions={editorExtensions}
                    onChange={updateSourceCode}
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: true,
                      highlightActiveLine: true,
                      bracketMatching: true,
                      closeBrackets: true,
                      autocompletion: true,
                      indentOnInput: true,
                      tabSize: 4,
                    }}
                  />
                </div>
                <details className="stdin-details">
                  <summary><ChevronDown size={13} /> Standard input <span>Optional</span></summary>
                  <textarea aria-label="Program standard input" value={stdin} onChange={(event) => setStdin(event.target.value)} placeholder="Type input for your program here…" />
                </details>
                <div className="editor-footer">
                  <div className={`editor-hint ${languageLoadError ? 'load-error' : ''}`}><span className="hint-pulse" /> {languageLoadError || (languageExtension ? 'Ctrl / Cmd + Enter to run' : `Loading ${selectedLanguage.label} editor…`)}</div>
                  <button className="execute-button" onClick={executeCode} disabled={isRunning || !sourceCode.trim() || !languageExtension}>
                    {isRunning ? <span className="button-spinner" /> : <Play size={13} fill="currentColor" />}
                    {isRunning ? 'Running…' : 'Run code'}
                  </button>
                </div>
              </div>

              <div className="editor-pane output-pane" ref={outputPaneRef}>
                <div className="pane-heading">
                  <div className="output-tabs" role="tablist" aria-label="Run output">
                    {languageId === 'html' && <button className={`output-tab ${activeOutputTab === 'preview' ? 'selected' : ''}`} role="tab" aria-selected={activeOutputTab === 'preview'} onClick={() => setActiveOutputTab('preview')}><Code2 size={13} /> Preview</button>}
                    <button className={`output-tab ${activeOutputTab === 'console' ? 'selected' : ''}`} role="tab" aria-selected={activeOutputTab === 'console'} onClick={() => setActiveOutputTab('console')}><SquareTerminal size={13} /> Output {execution.entries.length > 0 && <span>{execution.entries.length}</span>}</button>
                    <button className={`output-tab ${activeOutputTab === 'analysis' ? 'selected' : ''}`} role="tab" aria-selected={activeOutputTab === 'analysis'} onClick={() => setActiveOutputTab('analysis')}><Braces size={13} /> Checks {analysis.diagnostics.length > 0 && <span>{analysis.diagnostics.length}</span>}</button>
                  </div>
                  <button className="editor-icon-button" onClick={() => setExecution({ status: 'idle', entries: [], duration: null, error: null })} aria-label="Clear output" title="Clear output"><Trash2 size={13} /></button>
                </div>
                <div className="console-meta">
                  <span className={`execution-status ${execution.status}`}>
                    <i />
                    {execution.status === 'running' ? 'Running' : execution.status === 'success' ? 'Finished' : execution.status === 'error' ? 'Stopped' : 'Ready'}
                  </span>
                  {execution.duration !== null && <span>{execution.duration.toFixed(1)} ms</span>}
                </div>
                {activeOutputTab === 'preview' ? (
                  <div className="preview-output" role="tabpanel" aria-label="HTML preview">
                    {execution.previewHtml
                      ? <><iframe title="HTML and CSS preview" sandbox="" srcDoc={execution.previewHtml} /><div className="preview-note">Scripts are disabled in the preview for safety.</div></>
                      : <div className="console-empty"><Code2 size={18} /><span>Your page preview will appear here.</span><small>Press Run to render the current HTML and CSS.</small></div>}
                  </div>
                ) : activeOutputTab === 'console' ? (
                  <div className="console-output" role="log" aria-live="polite" aria-label="Program output">
                    {execution.status === 'idle' && <div className="console-empty"><Terminal size={18} /><span>Output will appear here.</span><small>Press Run code or Ctrl + Enter.</small></div>}
                    {execution.status === 'running' && <div className="console-empty"><span className="button-spinner" /><span>Running your {selectedLanguage.label}…</span><small>{languageId === 'javascript' || languageId === 'html' ? 'Locally in your browser' : 'Sending source to Wandbox online compiler'}</small></div>}
                    {execution.entries.map((entry, index) => <div className={`console-entry ${entry.type}`} key={`${index}-${entry.text}`}><span>{entry.type === 'error' ? '×' : entry.type === 'warn' ? '!' : '›'}</span><pre>{entry.text}</pre></div>)}
                    {execution.error && <div className="runtime-error"><AlertTriangle size={14} /><pre>{execution.error}</pre></div>}
                    {execution.status === 'success' && execution.entries.length === 0 && <div className="console-empty"><CheckCircle2 size={17} /><span>Finished with no output.</span></div>}
                  </div>
                ) : (
                  <div className="analysis-output" role="tabpanel">
                    <div className="analysis-toolbar">
                      <div>
                        <strong>Static checks</strong>
                        <span>{analyzerName ? `Powered by ${analyzerName}` : `No checker configured for ${selectedLanguage.label}`}</span>
                      </div>
                      <button
                        className="analyze-button"
                        onClick={analyzeCode}
                        disabled={!analyzerName || analysis.status === 'running' || !sourceCode.trim()}
                      >
                        {analysis.status === 'running' ? <span className="button-spinner" /> : <Braces size={14} />}
                        {analysis.status === 'running' ? 'Checking…' : 'Analyze code'}
                      </button>
                    </div>
                    <div className={`analysis-summary ${analysis.status === 'error' ? 'analysis-error' : ''}`}>
                      {analysis.status === 'running'
                        ? `Sending ${selectedLanguage.label} source to the local ${analyzerName} service…`
                        : analysis.status === 'error'
                          ? analysis.error
                          : analysis.status === 'success'
                            ? analysis.summary
                            : analyzerName
                              ? `Run ${analyzerName} against the current editor contents.`
                              : `Execution is available, but static analysis is not configured for ${selectedLanguage.label}.`}
                    </div>
                    {analysis.status === 'success' && analysis.diagnostics.length === 0 && <div className="diagnostic-item success"><CheckCircle2 size={15} /><span>No issues matched the configured {analysis.analyzer} rules.</span></div>}
                    {analysis.diagnostics.map((finding, index) => (
                      <div className={`diagnostic-item ${finding.severity}`} key={`${finding.rule}-${finding.line}-${finding.column}-${index}`}>
                        {finding.severity === 'error' ? <AlertTriangle size={15} /> : <CircleDot size={14} />}
                        <span>
                          <span className="diagnostic-location">{finding.line ? `Line ${finding.line}${finding.column ? `:${finding.column}` : ''} · ` : ''}{finding.rule}</span>
                          {finding.message}
                        </span>
                      </div>
                    ))}
                    <div className="analysis-disclaimer">{analyzerName ? `Source is sent to this app's API server for static ${analysis.analyzer || analyzerName} checks. This is not AI review or a security audit.` : 'This backend has no static analyzer configured for this language.'} Supported here: JavaScript and Python. Don&apos;t submit secrets.</div>
                  </div>
                )}
                <div className="output-footer">
                  <span><CircleDot size={12} /> {languageId === 'javascript' ? 'Local JavaScript worker' : languageId === 'html' ? 'Local HTML preview' : 'Wandbox compiler'}</span>
                  <span>{execution.status === 'success' ? (languageId === 'html' ? 'Preview updated' : 'Exit code 0') : execution.status === 'error' ? (execution.signal ? `Signal ${execution.signal}` : execution.exitCode != null ? `Exit code ${execution.exitCode}` : 'Runtime error') : 'Browser local'} <span className={`completion-dot ${execution.status === 'error' ? 'error-dot' : ''}`} /></span>
                </div>
              </div>
            </div>
            <div className="workspace-bottomline"><span><Command size={12} /> {selectedLanguage.label} <strong>{languageId === 'html' ? 'Live preview' : languageId === 'javascript' ? 'Local' : 'Online'}</strong></span><span>{languageId === 'javascript' || languageId === 'html' ? 'Code stays in your browser' : 'Code sent to Wandbox.org when you run'} <span className="bottom-separator">/</span> Not a security sandbox</span></div>
          </div>
          <div className="studio-trust"><span><ShieldCheck size={14} /> JavaScript runs in a Web Worker</span><span className="trust-separator" /><span>Other languages use Wandbox.org</span><span className="trust-separator" /><span>Never send secrets</span></div>
        </section>

        <section className="features-section content-width">
          <div className="section-heading feature-heading">
            <div>
              <h2>Useful work. <span className="gradient-text">No theatre.</span></h2>
            </div>
            <p className="heading-aside">Interfaces are the product.<br />Code is the machinery.</p>
          </div>
          <div className="feature-grid editorial-bento">
            {features.map(({ number, icon: Icon, title, description, tags, accent }) => (
              <article className={`feature-card glass-panel accent-${accent}`} key={number}>
                <div className="feature-card-top"><span className="feature-icon"><Icon size={19} /></span><span className="feature-number">{number} / 03</span></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="feature-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="telemetry-section section-anchor" id="telemetry">
          <div className="content-width">
            <div className="section-heading">
              <div>
                <h2>What runs <span className="gradient-text">where.</span></h2>
                <p>These are the actual execution paths in this build, not live service statistics.</p>
              </div>
                <div className="telemetry-live"><span className="demo-dot" /> Current build <span className="telemetry-time">23 languages</span></div>
            </div>
            <div className="telemetry-grid">
              {telemetry.map(({ label, value, change, icon: Icon }) => (
                <article className="telemetry-card glass-panel" key={label}>
                  <div className="telemetry-card-heading"><span><Icon size={15} /> {label}</span></div>
                  <div className="telemetry-value">{value}</div>
                  <div className="telemetry-change">{change}</div>
                </article>
              ))}
            </div>
            <div className="run-disclosure">
              <strong>Before you paste anything private</strong>
              <span>JavaScript runs locally but is not a security sandbox. For other languages, your source and stdin are sent to Wandbox.org when you run them. Don&apos;t submit secrets.</span>
            </div>
          </div>
        </section>

        <section className="architecture-section content-width section-anchor" id="architecture">
          <div className="section-heading">
            <div>
              <h2>How this <span className="gradient-text">is built.</span></h2>
            </div>
            <div className="architecture-label"><GitBranch size={14} /> Source-level implementation notes</div>
          </div>
          <div className="architecture-grid">
            {architecture.map(({ label, title, icon: Icon, description, items, color }, index) => (
              <article className={`architecture-card glass-panel architecture-${color}`} key={title}>
                <div className="architecture-card-heading"><span>{label}</span><span className="architecture-index">0{index + 1}</span></div>
                <span className="architecture-icon"><Icon size={21} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="architecture-rule" />
                <ul>{items.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="system-connection"><span /><span className="connection-node"><Zap size={13} /></span><span /> <span className="connection-label">One browser app. One remote compiler boundary.</span></div>
        </section>

        <section className="closing-cta content-width">
          <div className="cta-orb" aria-hidden="true" />
          <div className="cta-content">
            <h2>Bring a snippet.<br /><span className="gradient-text">See what actually happens.</span></h2>
            <p>Choose a language, edit the source, then run or check it.</p>
            <button className="button-primary" onClick={() => navigateTo('studio')}>Open the editor <ArrowRight size={16} /></button>
          </div>
          <div className="cta-decoration"><span>23</span><span>languages<br />one editor</span></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner content-width">
          <button className="brand-lockup footer-brand" onClick={() => navigateTo('top')} aria-label="Nexara home">
            <span className="brand-mark"><Cpu size={18} strokeWidth={1.8} /></span>
            <span className="brand-name">NEXARA<span className="brand-period">.</span></span>
          </button>
          <span className="footer-note">No AI review. No live telemetry. Just a code playground.</span>
          <span className="copyright">© 2026 NEXARA</span>
        </div>
      </footer>

      {toast && <div className="toast-message" role="status"><Check size={15} />{toast}</div>}
    </div>
  )
}

export default App
