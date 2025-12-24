const fs = require('fs');
const path = require('path');

const scenePath = process.argv[2] || 'assets/MainScene.scene';
const targetUuid = process.argv[3] || '73+0urzn9Op6DT3qzzSZcK';

if (!fs.existsSync(scenePath)) {
    console.error(`File not found: ${scenePath}`);
    process.exit(1);
}

const scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'));

function resolve(obj, depth = 0) {
    if (!obj) return null;
    
    // If it's a reference to another object in the array
    if (obj.__id__ !== undefined) {
        return resolve(scene[obj.__id__], depth);
    }

    // If it's an array, resolve each element
    if (Array.isArray(obj)) {
        return obj.map(item => resolve(item, depth));
    }

    // If it's an object, clone and resolve its children/components
    if (typeof obj === 'object') {
        const result = { ...obj };
        
        if (result._children) {
            result.children_resolved = result._children.map(c => resolve(c, depth + 1));
        }
        if (result._components) {
            result.components_resolved = result._components.map(c => resolve(c, depth + 1));
        }
        
        return result;
    }

    return obj;
}

const targetNode = scene.find(n => n._id === targetUuid);

if (targetNode) {
    const fullTree = resolve(targetNode);
    console.log(JSON.stringify(fullTree, null, 2));
} else {
    console.error(`Node with UUID ${targetUuid} not found.`);
}
