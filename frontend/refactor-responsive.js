const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace strict grid-cols-2 with grid-cols-1 sm:grid-cols-2
    // Lookbehind ensures we don't match sm:grid-cols-2, md:grid-cols-2, etc.
    content = content.replace(/(?<![a-z0-9-]:)\bgrid-cols-2\b/g, 'grid-cols-1 sm:grid-cols-2');

    // Replace strict grid-cols-3 with grid-cols-1 sm:grid-cols-2 md:grid-cols-3
    content = content.replace(/(?<![a-z0-9-]:)\bgrid-cols-3\b/g, 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3');

    // Replace strict grid-cols-4 with grid-cols-1 sm:grid-cols-2 md:grid-cols-4
    content = content.replace(/(?<![a-z0-9-]:)\bgrid-cols-4\b/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
    
    // Replace strict grid-cols-5 with grid-cols-1 sm:grid-cols-2 lg:grid-cols-5
    content = content.replace(/(?<![a-z0-9-]:)\bgrid-cols-5\b/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5');

    // Fix hardcoded widths like w-[300px] or w-[400px] or w-[500px]
    // ONLY replace if it's not already preceded by responsive prefixes
    // And limit to 300px - 999px
    content = content.replace(/(?<![a-z0-9-]:)\bw-\[([3-9][0-9]{2})px\]/g, 'w-full max-w-[$1px]');
    
    // Clean up any double `grid-cols-1 grid-cols-1` that might have happened if it already had grid-cols-1
    content = content.replace(/\bgrid-cols-1\s+grid-cols-1\b/g, 'grid-cols-1');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`Total files updated: ${changedFiles}`);
