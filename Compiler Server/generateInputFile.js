const fs = require('fs');
const path = require("path");
const {v4 : uuid} = require('uuid');

const dirInputs = path.join(__dirname,"inputs");

if(!fs.existsSync(dirInputs)){
    fs.mkdirSync(dirInputs,{recursive: true});
}
const generateInputFile = function (input){
    const jobId = uuid();
    const fileName = `${jobId}.txt`;
    const filePath = path.join(dirInputs,fileName);
    fs.writeFileSync(filePath,input);
    return filePath;
};
module.exports = generateInputFile;