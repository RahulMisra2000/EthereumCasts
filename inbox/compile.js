// advantage of path is that it is cross platform.... this will work on any nodejs platform
const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');

// We cannot do  ....  const x = require('Inbox.sol'); BECAUSE what require does is parse and execute the code...
// and it is solidity code and not javascript and when it gets parsed and executed there will be errors...
// therefore it needs to be read...
const source = fs.readFileSync(inboxPath, 'utf8');

// We don't have to do .contracts[:Inbox] .....  if you do console.log(solc.compile(source, 1)); 
// you will see why we are doing it ... because we are just interested in part of the entire LARGE OBJECT
module.exports = solc.compile(source, 1).contracts[':Inbox'];
