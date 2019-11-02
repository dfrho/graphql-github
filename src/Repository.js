import React from 'react';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import translate from 'moji-translate';
import './index.css';

const Repository = ({ repository, onFetchMoreIssues, onToggleStarRepo }) =>
  (
    <div>
      <p className="strong">
        <strong>{`In Its GitHub Repository: `}</strong>
        <a href={repository.url}>{`${repository.name}`}</a>
      </p>
      <Button variant="outlined" type="button" onClick={() => onToggleStarRepo(repository.id, repository.viewerHasStarred)}>
        {repository.stargazers.totalCount}{' '}
        {repository.viewerHasStarred ? 'unstar' : 'star'}
      </Button>
      {repository.issues.edges.map(issue =>
        <Stacked>
          <hr />
          <a href={issue.node.url}>{issue.node.title}</a>
          <ul>
            {issue && issue.node && issue.node.reactions && issue.node.reactions.edges.map(reaction => (
              <li key={reaction.node.id}>
                {translate.translate(reaction.node.content.replace('_', ''))}
              </li>
            ))}
          </ul>

        </Stacked>
      )}
      <hr />
      {repository.issues.pageInfo.hasNextPage && <Button variant="outlined" onClick={onFetchMoreIssues}>More</Button>}
    </div>
  )

const Stacked = styled.div`
> * + * {
  margin-top: 1.8rem;
  }

  a {
    color: red;
    font-family: helvetica;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  a:active {
    color: black;
  }

  a:visited {
    color: purple;
  }

`

export default Repository;
