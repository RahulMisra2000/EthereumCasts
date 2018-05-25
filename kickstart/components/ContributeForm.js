import React, { Component } from 'react';
import { Form, Input, Message, Button } from 'semantic-ui-react';
import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

class ContributeForm extends Component {
  state = {
    value: '',
    errorMessage: '',
    loading: false
  };

  onSubmit = async event => {     // has to be marked with async because we are using await inside this function
    event.preventDefault();       // we don't want any postback to happen since we are handling everything with submission

    // the address here is being sent to this component by a parent component vid data binding ....
    // anything sent this way gets automatically added to the props property of the component...and that is why address is available
    // as this.props.address
    const campaign = Campaign(this.props.address);

    this.setState({ loading: true, errorMessage: '' });   // setting loading to true so that animation starts to give users
    // feedback because we are creating and sending a Transaction object (.send()) because we are calling setter methods in the contract 
    // and they take time 30 seconds+ to finish .... so FEEDBACK is CRITICAL ***********

    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei(this.state.value, 'ether')
      });

      Router.replaceRoute(`/campaigns/${this.props.address}`);    // Programmatic Redirect
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false, value: '' });
  };

  render() {
    return (
      // We are using the semantic-ui-react 3rd party librarie's ui widgets and error ... loading etc ... are all features it offers
      // basically if the error property on the <Form widget is true then the <Message element displays  
      // Similarly, that libraries Button widget has a loading property .. if it is set to true then it does animation and if 
      // it is false then, it shows just the text between <Button> and  </Button>
      // That is just how this 3rd party libraries' widget work ...
      
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Amount to Contribute</label>
          <Input
            value={this.state.value}
            onChange={event => this.setState({ value: event.target.value })}
            label="ether"
            labelPosition="right"
          />
        </Form.Field>

        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button primary loading={this.state.loading}>
          Contribute!
        </Button>
      </Form>
    );
  }
}

export default ContributeForm;
