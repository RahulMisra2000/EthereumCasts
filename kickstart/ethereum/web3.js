import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  // We are in the browser and metamask is running.
  // So, let's use the Provider that MetaMask uses
  web3 = new Web3(window.web3.currentProvider);
} else {
  // We are on the server (because of server-side rendering) *OR* we are on the client (in browser) and the user is not running MetaMask
  // So, we use the HttpProvider
  const provider = new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'
  );
  web3 = new Web3(provider);
}

export default web3;
