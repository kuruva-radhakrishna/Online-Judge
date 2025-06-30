const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputsPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputsPath)) {
    fs.mkdirSync(outputsPath, { recursive: true });
}

const executePython = async function (filePath, inputFilePath) {
    const cleanup = () => {
        [filePath, inputFilePath].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlink(file, () => {});
            }
        });
    };

    return new Promise((resolve, reject) => {
        const runCommand = `python "${filePath}" < "${inputFilePath}"`;
        const start = process.hrtime();

        exec(runCommand, (error, stdout, stderr) => {
            const diff = process.hrtime(start);
            const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

            const rawMessage = stderr || error?.message || '';
            const normalizedMessage = rawMessage.replace(/\r\n/g, '\n');


            if (error) {
                cleanup();
                console.log('error in execute' , error);
                if (normalizedMessage.includes('SyntaxError')) {
                    return reject({ type: 'syntax', message: normalizedMessage });
                } else if (normalizedMessage.includes('Traceback')) {
                    return reject({ type: 'runtime', message: normalizedMessage });
                } else {
                    return reject({ type: 'internal', message: normalizedMessage });
                }
            }

            cleanup();
            return resolve({
                output: stdout,
                timeMs,
            });
        });
    }).catch(err => {
        cleanup();
        return Promise.reject(err);
    });
};

module.exports = executePython;
