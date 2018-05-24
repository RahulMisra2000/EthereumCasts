const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// Campaign.sol contains the CampaignFactory contract and the Campaign contract
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');

// Compiling both the contracts
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

// Creating separate files to hold the compiled codes of the two contracts
for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':', '') + '.json'),
    output[contract]
  );
}
