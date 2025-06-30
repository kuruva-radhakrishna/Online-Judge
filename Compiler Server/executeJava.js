const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const executeJava = async function (filePath, inputFilePath) {
    const classDir = path.dirname(filePath);
    const className = path.basename(filePath, '.java'); // 🟢 Extracts: main_<uuid>

    const cleanup = () => {
        [filePath, inputFilePath, path.join(classDir, `${className}.class`)].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlink(file, () => {});
            }
        });
    };

    return new Promise((resolve, reject) => {
        const compileCommand = `javac "${filePath}"`;

        exec(compileCommand, (compileError, _, compileStderr) => {
            if (compileError) {
                cleanup();
                return reject({ type: 'compilation', message: compileStderr });
            }

            const runCommand = `java -cp "${classDir}" ${className} < "${inputFilePath}"`;
            const start = process.hrtime();

            exec(runCommand, (runError, stdout, stderr) => {
                const diff = process.hrtime(start);
                const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

                cleanup();

                if (runError) {
                    return reject({ type: 'runtime', message: stderr || runError.message });
                }

                return resolve({ output: stdout, timeMs });
            });
        });
    }).catch(err => {
        cleanup();
        return Promise.reject(err);
    });
};

module.exports = executeJava;
