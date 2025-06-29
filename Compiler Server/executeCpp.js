const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputsPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputsPath)) {
    fs.mkdirSync(outputsPath, { recursive: true });
}

const executeCpp = async function (filePath, inputFilePath) {
    const jobId = path.basename(filePath).split('.')[0];
    const outputFilePath = path.join(outputsPath, `${jobId}.exe`);

    // ✅ Helper to delete temporary files
    const cleanup = () => {
        [filePath, inputFilePath, outputFilePath].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlink(file, () => {});
            }
        });
    };

    return new Promise((resolve, reject) => {
        // ✅ Step 1: Compile the C++ file
        const compileCommand = `g++ "${filePath}" -o "${outputFilePath}"`;
        exec(compileCommand, (compileError, stdout, stderr) => {
            if (compileError) {
                cleanup();
                return reject({ type: 'compilation', message: stderr });
            }

            // ✅ Step 2: Run the executable with input redirection
            const runCommand = `cmd /c "${outputFilePath}" < "${inputFilePath}"`;
            const start = process.hrtime(); // start timer

            exec(runCommand, (runError, runOut, runErr) => {
                const diff = process.hrtime(start);
                const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

                cleanup(); // remove all temporary files

                if (runError) {
                    return reject({ type: 'runtime', message: runErr || runError.message });
                }

                return resolve({
                    output: runOut,
                    timeMs,
                });
            });
        });
    }).catch(err => {
        cleanup();
        return Promise.reject(err);
    });
};

module.exports = executeCpp;
