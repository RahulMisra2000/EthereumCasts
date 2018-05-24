// ------------------------------------------------------------------
// DEPLOYING the ContractFactory contract in Rinkeby Ethereum Network
// ------------------------------------------------------------------


const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

// this contains the compiled code of the CampaignFactory contract
const compiledFactory = require('./build/CampaignFactory.json');


const provider = new HDWalletProvider(
  'call glow acoustic vintage front ring trade assist shuffle mimic volume reject',
  'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'    // using INFURA (IaaS) we will connect to a Rinkeby Node
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  // Only DEPLOYING the CampaignFactory contract. Will not be deploying the Campaign Factory from here.
  // It will be deployed when the createCampaign() function in the CampaignFactory is called
  // because that function does the deployment (using solidity code)
  const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
                    .deploy({ data: compiledFactory.bytecode })
                    .send({ gas: '1000000', from: accounts[0] });

  
  // This address (where the contract is deployed is very important. We will need it to access the functions defined in it
  console.log('Contract deployed to', result.options.address);
};
deploy();
