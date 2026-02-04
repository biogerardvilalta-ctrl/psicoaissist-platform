const fs = require('fs');

const files = ['messages/es.json', 'messages/en.json', 'messages/ca.json'];

function findKey(obj, target, currentPath = '') {
    for (const key in obj) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        if (key === target) {
            console.log(`FOUND: ${newPath}`);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            findKey(obj[key], target, newPath);
        }
    }
}

files.forEach(file => {
    console.log(`Checking ${file}...`);
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    findKey(content, 'ai_help_text_v2');
});
