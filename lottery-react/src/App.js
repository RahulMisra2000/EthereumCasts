import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  async componentDidMount() {
    
    // we don't have to provide the form: property in the call ... like so  .call({from: account making the request})
    // because the provider that MetaMask uses, uses the currently selected account in MetaMask chrome plugin by default
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    // Both Human accounts (aka external accounts) and Contract Accounts have address and balance associated with them.
    // The balance is NOT a number. It is a number wrapped in a special object and that is why it is initialized
    // in the state with this value '' and not 0
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }

  onSubmit = async event => {
    event.preventDefault();

    // This will return all the Human accounts that the PROVIDER knows about.
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered!' });
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();
    
    this.setState({ message: 'Waiting on transaction success...' });
// The above message is being done to give the user some feedback because anytime we create and send a Transaction (.send()) to 
// the Ethereum network to ** WRITE ** to the Blockchain, it will take about 30 seconds ...
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    
// Now the work has been done so, let the user know
    this.setState({ message: 'A winner has been picked!' });
  };

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}. There are currently{' '}
          {this.state.players.length} people entered, competing to win{' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />

        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        <hr />

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
