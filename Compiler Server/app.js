require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();


const { connection } = require('./Database/Connection.js');
const generateFile = require("./generateFile.js");
const executeCpp = require("./executeCpp.js");
const generateInputFile = require("./generateInputFile.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173','http://localhost:3000'],
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('Welcome to compiler');
})

app.post('/run', async (req, res) => {
    try {
        const { language, code,input } = req.body;
        
        if (!code) {
            return res.status(400).json({ message: "Empty code" });
        }
        const filePath = generateFile(language, code);
        const inputFilePath = generateInputFile(input);
        const output = await executeCpp(filePath,inputFilePath);
        res.status(200).json({ output });
    } catch (err) {
        if (err.type === 'compilation') {
            res.json({ errorType: 'Compilation Error', error: err.message });
        } else if (err.type === 'runtime') {
            res.json({ errorType: 'Runtime Error', error: err.message });
        } else {
            res.status(500).json({ errorType: 'Internal Error', error: err.message });
        }
    }
})
app.listen(8000, () => {
    console.log('app listening on port 8000');
})
connection();
