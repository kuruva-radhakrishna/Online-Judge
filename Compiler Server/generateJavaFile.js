const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const codesDir = path.join(__dirname, 'codes');
if (!fs.existsSync(codesDir)) {
    fs.mkdirSync(codesDir, { recursive: true });
}

const generateJavaFile = (originalCode) => {
    const jobId = uuid().split('-')[0]; // short unique ID
    const className = `main_${jobId}`;  // e.g. Main_8fd10574

    // Replace public class Main with the unique class name
    const updatedCode = originalCode.replace(/public class\s+Main/, `public class ${className}`);

    const filePath = path.join(codesDir, `${className}.java`);
    fs.writeFileSync(filePath, updatedCode);

    return filePath;
};

module.exports = generateJavaFile;
