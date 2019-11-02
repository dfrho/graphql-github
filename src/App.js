import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import './App.css';
import Organization from './Organization';

const TITLE = 'GitHub Repo Issue Tracker'

// results resolvers, shape return data for local state
const resolveAddStarMutation = mutationResult => state => {
  const { viewerHasStarred } = mutationResult.data.data.addStar.starrable;
  const { totalCount } = state.organization.repository.stargazers;

  return {
    ...state,
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalCount + 1
        }
      }
    }
  }
}

const resolveRemoveStarMutation = mutationResult => state => {
  const { viewerHasStarred } = mutationResult.data.data.removeStar.starrable;
  const { totalCount } = state.organization.repository.stargazers;

  return {
    ...state,
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalCount - 1
        }
      }
    }
  }
}

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

// graphql query shapers
const ADD_STAR = `
  mutation ($repositoryId: ID!) {
    addStar(input:{starrableId:$repositoryId}) {
      starrable {
        viewerHasStarred
      }
    }
  }
`;


const REMOVE_STAR = `
  mutation ($repositoryId: ID!) {
    removeStar(input:{starrableId:$repositoryId}) {
      starrable {
        viewerHasStarred
      }
    }
  }
`;

const GET_ISSUES_OF_REPOSITORY = `
  query ($organization: String!, $repository: String!, $cursor: String) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        id
        name
        url
        stargazers {
          totalCount
        }
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

// axios creator
const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
      }`,
  },
});

// axios-query-creators
const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split('/');
  return axiosGitHubGraphQL
    .post('', {
      query: GET_ISSUES_OF_REPOSITORY,
      variables: { organization, repository, cursor }
    })
}

const removeStarFromRepo = repositoryId => {
  return axiosGitHubGraphQL
    .post('', {
      query: REMOVE_STAR,
      variables: { repositoryId },
    })
}


const addStarToRepo = repositoryId => {
  return axiosGitHubGraphQL.post('', {
    query: ADD_STAR,
    variables: { repositoryId },
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


  onToggleStarRepo = (repoId, viewerHasStarred) => {
    if (viewerHasStarred) {
      removeStarFromRepo(repoId).then(mutationResult =>
        this.setState(resolveRemoveStarMutation(mutationResult)),
      );
    } else {
      addStarToRepo(repoId).then(mutationResult =>
        this.setState(resolveAddStarMutation(mutationResult)),
      );
    }
  };

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

              <div className="search-bar">
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
              </div>
            </form>
          </div>
        </Paper>

        {
          organization ? (
            <Organization onToggleStarRepo={this.onToggleStarRepo} onFetchMoreIssues={this.onFetchMoreIssues} organization={organization} errors={errors}></Organization>
          ) : (
              <p>Loading...</p>
            )
        }
      </div >
    );
  }
}

export default App;
