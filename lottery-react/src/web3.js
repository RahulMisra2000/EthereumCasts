// We did npm install of the latest web3.js library so it was installed in node_modules
// So, now Web3 refers to it
import Web3 from 'web3';

// window.web3 is the one that MetaMask Chrome plugin injects into every active page in Chrome browser
// It comes with a Provider which we want to HIJACK and use with the new Web3 so, when creating an instance of the new Web3 we use 
// that provider as shown below.

const web3 = new Web3(window.web3.currentProvider);

// We do a default so that it can be imported without placing a name inside the curly brace.
export default web3;
