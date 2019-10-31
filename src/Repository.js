import React from 'react'
import styled from 'styled-components'
import translate from 'moji-translate';

const Repository = ({ repository, onFetchMoreIssues }) =>
  (
    <div>
      <p>
        <strong>{`In Its GitHub Repository: `}</strong>
        <a href={repository.url}>{`${repository.name}`}</a>
      </p>
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
      {repository.issues.pageInfo.hasNextPage && <button onClick={onFetchMoreIssues}>More</button>}
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
