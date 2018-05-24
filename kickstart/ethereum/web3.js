import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  // We are in the browser and metamask is running.
  // So, let's HIJACK the Provider that MetaMask uses by accessing it from the web3 instance that MetaMask injects into the actice Chrome
  // tab
  // VERY IMP:   Web3         is the new version of Web3.js library that we installed using npm during the project setup phase
  //             window.web3  is the instance of Web3.js library that MetaMask injects into the active Chrome page. This version may be OLD
  //                          and that is why we use a newer version of Web3.js by getting it directly from npm
  //                          but we use the provider that MetaMask uses
  web3 = new Web3(window.web3.currentProvider);
} else {
  // We are on the server (because of server-side rendering) *OR* we are on the client (in browser) and the user is not running MetaMask
  // So, we use the HttpProvider
  const httpProvider = new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'
  );
  web3 = new Web3(httpProvider);
}
