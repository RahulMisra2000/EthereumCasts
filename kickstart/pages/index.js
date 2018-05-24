import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';

class CampaignIndex extends Component {
  
  // next.js (like Angular UNIVERSAL to do SSR, except it has a lot of other features)
  // It calls this lifecycle method *** during SSR *** and so in this function we can get the data from the contract
  // and return it. next.js takes the returned "stuff" and INJECTS it into the props property of this component (this.props. ) so that 
  // it can be accessed by any function in this component.
  static async getInitialProps() { 
    const campaigns = await factory.methods.getDeployedCampaigns().call();  // returns an array of addresses ...

    return { campaigns };   // ES6 feature .. this is same as  return { campaigns : campaigns };
  }


  
  renderCampaigns() {
    const items = this.props.campaigns.map(address => {
      return {
        header: address,
        description: (
          <Link route={`/campaigns/${address}`}>
            <a>View Campaign</a>
          </Link>
        ),
        fluid: true
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <div>
          <h3>Open Campaigns</h3>

          <Link route="/campaigns/new">
            <a> <Button floated="right" content="Create Campaign" icon="add circle"  primary  />  </a>
          </Link>

          {this.renderCampaigns()}    // Inside the render(), all javascript stuff has to be placed inside {  }
                                      // that is why the renderCampaigns() method call is placed inside it 
        </div>
      </Layout>
    );
  }
}

export default CampaignIndex;
