var fs = require('fs');
var path = require('path');

const fixFile = (filePath) => {
    const data = fs.readFileSync(filePath);
    if (data) {
        const text = data.toString();
        const newText = replaceImage(text);
        fs.writeFileSync(filePath, newText);
    }
};

const replaceImage = (text, newImage = 'icons/svg/mystery-man.svg') => {
    const regex = /(?<="img":")(.*?)(?=")/g;
    return text.replace(regex, `${newImage}`);
};

const fixFilesInDirectory = (dir) => {
    const directoryPath = path.join(__dirname, dir);
    console.log(directoryPath);
    fs.readdir(directoryPath, function (err, items) {
        for (const item of items) {
            const newPath = path.join(directoryPath, item);
            console.log(newPath);
            fixFile(newPath);
        }
    });
};
fixFilesInDirectory('./packs');
