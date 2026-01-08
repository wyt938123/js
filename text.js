const path = require('path');
const http = require('http');
console.log("This is text.js file");
let mypath = path.join(__dirname, 'myfolder', 'myfile.txt');
console.log("Joined path:", mypath);
http.createServer((req, res) => {
    console.log('Received request for:');
} ).listen(8080,() => {
    console.log('Server is listening on port 8080');
});