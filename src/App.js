import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import './App.css';
import Organization from './Organization';


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
const resolveIssuesQuery = (queryResult, cursor) => state => {

  const { data, errors } = queryResult.data;

  if (!cursor) {
    return {
      organization: data.organization,
      errors
    }
  }

  const { edges: oldIssues } = state.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;

  const updatedIssues = [...oldIssues, ...newIssues];

  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
          ...data.organization.repository.issues,
          edges: updatedIssues
        }
      }
    },
    errors,
  };
};

const ADD_STAR = `
  mutation($repositoryId: ID!){
    addStar(input:(starrableId: $repositoryId)){
      starrable {
        viewerHasStarred
      }
    }
  }
`

// query shaper
const GET_ISSUES_OF_REPOSITORY = `
  query ($organization: String!, $repository: String!, $cursor: String) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        id
        name
        url
        viewerHasStarred
        issues(first: 5, after: $cursor, states: [OPEN]) {
          edges {
            node {
              id
              title
              url
              reactions(last: 3) {
                edges {
                  node {
                    id
                    content
                  }
                }
              }
            }
          }
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

// query-creators
const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split('/');
  return axiosGitHubGraphQL
    .post('', {
      query: GET_ISSUES_OF_REPOSITORY,
      variables: { organization, repository, cursor }
    })
}

const addStarToRepo = repositoryId => {
  return axiosGitHubGraphQL
    .post('', {
      query: ADD_STAR,
      variables: { repositoryId }
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

  onFetchFromGitHub = (path, cursor) => {
    getIssuesOfRepository(path, cursor)
      .then(result =>
        this.setState(resolveIssuesQuery(result, cursor))
      )
      .catch(error =>
        console.error('Errors happen. Here is one: ', error)
      )
  }

  onFetchMoreIssues = () => {
    const { endCursor } = this.state.organization.repository.issues.pageInfo;
    this.onFetchFromGitHub(this.state.path, endCursor);
  }

  onStarRepo = (repoId, viewerHasStarred) => {
    addStarToRepo(repoId)
  }

  render() {
    const { organization, path, errors } = this.state;

    return (
      <div className="App" >
        <Paper>
          <div className="paper-container">
            <h2 className="App-header">
              {`🚧 ${TITLE}`}
            </h2>
            <form onSubmit={this.onSubmit}>

              <label htmlFor="url">
                Enter search terms in <i>[organization name/repo name]</i> format<br></br>
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
              <Button variant="outlined" type="submit">search</Button>
            </form>
          </div>
        </Paper>

        {
          organization ? (
            <Organization onStarRepo={this.onStarRepo} onFetchMoreIssues={this.onFetchMoreIssues} organization={organization} errors={errors}></Organization>
          ) : (
              <p>Loading...</p>
            )
        }
      </div >
    );
  }
}

export default App;
