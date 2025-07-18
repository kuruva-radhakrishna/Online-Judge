const fs = require('fs');
const path = require("path");
const {v4 : uuid} = require('uuid');

const dirCodes = path.join(__dirname,"codes");

if(!fs.existsSync(dirCodes)){
    fs.mkdirSync(dirCodes,{recursive: true});
}
const generateFile = function (language,code){
    const jobId = uuid();
    const fileName = `${jobId}.${language}`;
    const filePath = path.join(dirCodes,fileName);
    fs.writeFileSync(filePath,code);
    return filePath;
};
module.exports = generateFile;