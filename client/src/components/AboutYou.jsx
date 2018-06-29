import React from 'react';
import { withRouter } from "react-router-dom";
import { Query } from "react-apollo";
import { GET_USER_FROM_DB } from '../apollo/serverQueries.js';
import {GET_USER_INFO} from '../apollo/localQueries.js';
import HealthSpeedometer from './HealthSpeedometer.jsx';




class AboutYou extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <Query query={GET_USER_INFO}>
          {(({data}) => {
            return (
              <Query query={GET_USER_FROM_DB} variables={{ _id: data.userInfo.userId }}>
                {({ loading, error, data }) => {
                  if (loading) return "Loading...";
                  if (error) return `Error! ${error.message}`;
                  var userStance = JSON.parse(data.user.user_stance);
                  var locPolRatio = JSON.parse(data.user.locPolRatio);
                  var homePolRatio = JSON.parse(data.user.homePolRatio);
                  var readingStance = JSON.parse(data.user.reading_stance[0]);
                  return (
                    <div>
                    <h1>Your Overall Political Stance:</h1>
                    <HealthSpeedometer 
                      height={100}
                      width={150}
                      value = {userStance}
                      startColor="blue"
                      endColor="red"
                      min={-1}
                      max={1}
                    />
                    <h1>The Political Stance of Your Current City:</h1>
                    <HealthSpeedometer 
                      height={100}
                      width={150}
                      value = {locPolRatio}
                      startColor="blue"
                      endColor="red"
                      min={-1}
                      max={1}
                    />
                    <h1>The Political Stance of Your Hometown:</h1>
                    <HealthSpeedometer 
                      height={100}
                      width={150}
                      value = {homePolRatio}
                      startColor="blue"
                      endColor="red"
                      min={-1}
                      max={1}
                    />
                    <h1>The Political Stance of Your Reading Habits:</h1>
                    <HealthSpeedometer 
                      height={100}
                      width={150}
                      value = {readingStance}
                      startColor="blue"
                      endColor="red"
                      min={-1}
                      max={1}
                    />
                    </div>
                  );
                }}
              </Query>
            );
          }
          )}
        </Query>
    );
  }

}

export default withRouter(AboutYou);