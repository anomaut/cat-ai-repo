# CAT-AI

# WebApp - Getting Started

**Intelligent Tutoring System to design dynamic interface for Education**

CAT-AI is a intelligent tutoring system enhanced with openai API to easily create, customize and export educational exercises for elementary and middle school.  

Thesis by: **Lorenzo Cuccu** <br>
Supervised by: **Luigi De Russis**,**Tommaso Calò**

## Prerequisites

- A valid OpenAI Key
- [Node.js](https://nodejs.org/) (recommended: latest LTS version)
- npm (comes with Node.js)
- Optional: [nodemon](https://www.npmjs.com/package/nodemon) for automatic server restarts

---

## Step-by-step Instructions


### 1: OpenAI API Key Setup

To use OpenAI services, you need to create a `.env` file inside the `/server` directory and add your API key.

1. Create a file named `.env` in the `server` folder (at the root of the backend).
2. Add the following line to the file: **OPENAI_API_KEY="your_openai_api_key_here"**

### 2: Client Terminal

Open the first terminal and input these commands to start the client

```bash
cd client
npm install
npm run dev
```

### 3: Server Terminal - Start the Server

Open the second terminal and input these commands to start the server

```bash
cd server
npm install
nodemon index.mjs //or node index.mjs
```
If nodemon is not installed globally, you can install it with:
```bash
npm install -g nodemon
```

### 4: Open CAT-AI

👉 http://localhost:5173