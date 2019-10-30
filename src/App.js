import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import Organization from './Organization'


// axios creator
const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
      }`,
  },
});

const TITLE = 'GitHub Repo Issue Tracker'

// results resolver shapes return data to local state
const resolveIssuesQuery = queryResult => () => ({
  organization: queryResult.data.data.organization,
  errors: queryResult.data.errors
})

// query shaper
const GET_ISSUES_OF_REPOSITORY = `
  query ($organization: String!,
  $repository: String!){
  organization(login: $organization) {
    name
    url
    repository(name: $repository ){
      name
      url
      issues(last: 5){
        edges {
          node {
            id
            title
            url

          }
        }
      }
    }
  }
}
`

// query-creator
const getIssuesOfRepository = path => {
  const [organization, repository] = path.split('/');
  return axiosGitHubGraphQL
    .post('', {
      query: GET_ISSUES_OF_REPOSITORY,
      variables: { organization, repository }
    })
}

class App extends Component {
  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null
  };

  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }

  onChange = event => {
    this.setState({
      path: event.target.value,
    })
  }

  onSubmit = event => {
    this.onFetchFromGitHub(this.state.path)
    event.preventDefault();
  }

  onFetchFromGitHub = path => {
    getIssuesOfRepository(path)
      .then(result =>
        this.setState(resolveIssuesQuery(result))
      )
      .catch(error =>
        console.error('Errors happen. Here is one: ', error)
      )
  }

  render() {
    const { organization, path, errors } = this.state;

    return (
      <div className="App" >
        <h2>
          {`🚧 ${TITLE}`}
        </h2>
        <form onSubmit={this.onSubmit}>
          >
          <label htmlFor="url">

            Show open issues for<br></br>
          </label>
          <label htmlFor="url">
            https://github.com/
        </label>
          <input
            id="url"
            type="text"
            onChange={this.onChange}
            value={path}
            style={{ width: '360px', marginRight: '20px' }}
          >
          </input>
          <button type="submit">Search</button>
        </form>
        <hr />
        {
          organization ? (
            <Organization organization={organization} errors={errors}></Organization>
          ) : (
              <p>Loading...</p>
            )
        }
      </div >
    );
  }
}

export default App;
