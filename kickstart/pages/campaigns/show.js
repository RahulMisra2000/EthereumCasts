import React, { Component } from 'react';
import { Card, Grid, Button } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import Campaign from '../../ethereum/campaign';
import web3 from '../../ethereum/web3';
import ContributeForm from '../../components/ContributeForm';
import { Link } from '../../routes';

class CampaignShow extends Component {
  
  // next.js gives us a lifecycle method called getInitialProps(props)
  // This props is not the same props that hangs off this component
  // This props contains route parameters, etc.
  static async getInitialProps(props) {
    const campaign = Campaign(props.query.address); // "props.query.address" -- address of the Campaign, passed as route parameter
    // campaign : this is the proxy object that points to the contract at address "props.query.address"

    const summary = await campaign.methods.getSummary().call();

    // The object returned by this method gets added to the props property of this component
    return {
      address: props.query.address,
      
      // Whenever a smart contract's getter function returns more than one value (getSummary() in our example does that), 
      // you will get an object back (summary in our example) whose keys will be ‘0’, ‘1’, ‘2’, ..  and whose values will 
      // be whatever you are returning… that is why we are subscripting to get to the value ... we are NOT getting an array back 
      // we are just using the subscript syntax way of accessing an object's properties....
      // ob = { x : 100 };   
      // ob['x'] is same as ob.x        // subscript way and dot way of accessing properties of an object
      minimumContribution: summary[0],
      balance: summary[1],
      requestsCount: summary[2],
      approversCount: summary[3],
      manager: summary[4]
    };
  }

  renderCards() {
    // This is just ES6 shorthand syntax for *** DESTRUCTURING *** an object
    const {
      balance,
      manager,
      minimumContribution,
      requestsCount,
      approversCount
    } = this.props;

    const items = [
      {
        header: manager,
        meta: 'Address of Manager',
        description:
          'The manager created this campaign and can create requests to withdraw money',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: minimumContribution,
        meta: 'Minimum Contribution (wei)',
        description:
          'You must contribute at least this much wei to become an approver'
      },
      {
        header: requestsCount,
        meta: 'Number of Requests',
        description:
          'A request tries to withdraw money from the contract. Requests must be approved by approvers'
      },
      {
        header: approversCount,
        meta: 'Number of Approvers',
        description:
          'Number of people who have already donated to this campaign'
      },
      {
        header: web3.utils.fromWei(balance, 'ether'),
        meta: 'Campaign Balance (ether)',
        description:
          'The balance is how much money this campaign has left to spend.'
      }
    ];

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <h3>Campaign Show</h3>
        <Grid>
          <Grid.Row>
      // Notice the {10} and {6} .. that is semantic-ui-react ... like Bootstrap... except here it should add to 16 .. in bootstrap 
      // it was 12 I think
            <Grid.Column width={10}>{this.renderCards()}</Grid.Column>

            <Grid.Column width={6}> <ContributeForm address={this.props.address} /> </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Link route={`/campaigns/${this.props.address}/requests`}>
                <a>
                  <Button primary>View Requests</Button>
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default CampaignShow;
