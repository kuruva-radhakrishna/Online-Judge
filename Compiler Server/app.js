require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();


const { connection } = require('./Database/Connection.js');
const generateFile = require("./generateFile.js");
const executeCpp = require("./executeCpp.js");
const generateInputFile = require("./generateInputFile.js");
const executeC = require("./executeC.js");
const executePython = require("./executePython.js");
const executeJava = require("./executeJava.js");
const generateJavaFile = require("./generateJavaFile.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_LOCAL,
    process.env.BACKEND_URL,
    process.env.BACKEND_URL_LOCAL
].filter(Boolean);

console.log(allowedOrigins);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('Welcome to compiler');
})

app.post('/run', async (req, res) => {
    try {
        const { language, code, input } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Empty code" });
        }
        const filePath = generateFile(language, code);
        const inputFilePath = generateInputFile(input);

        if (language === 'c') {
            const output = await executeC(filePath, inputFilePath);
            return res.status(200).json({ output });
        }
        if (language === 'cpp') {
            const output = await executeCpp(filePath, inputFilePath);
            return res.status(200).json({ output });
        }
        if (language === 'python') {
            const output = await executePython(filePath, inputFilePath);
            return res.status(200).json({ output });
        }
        if (language === 'java') {
            const javaFilePath = generateJavaFile(code);
            const output = await executeJava(javaFilePath, inputFilePath);
            return res.status(200).json({ output });
        }

    } catch (err) {
        console.log(err);

        // ✅ Helper to extract clean message
        const extractLastErrorLine = (message) => {
            if (!message) return '';
            const lines = message.trim().split('\n');
            return lines.reverse().find(line => line.trim().length > 0) || message;
        };

        const cleanMessage = extractLastErrorLine(err.message);

        if (err.type === 'compilation') {
            res.json({ errorType: 'Compilation Error', error: cleanMessage });
        } else if (err.type === 'runtime') {
            res.json({ errorType: 'Runtime Error', error: cleanMessage });
        } else if (err.type === 'syntax') {
            res.json({ errorType: 'Syntax Error', error: cleanMessage });
        } else {
            res.status(500).json({ errorType: 'Internal Error', error: cleanMessage });
        }

    }
})
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`app listening on port ${process.env.PORT}`);
});

connection();
