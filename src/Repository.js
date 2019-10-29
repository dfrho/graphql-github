import React from 'react'
import styled from 'styled-components'

const Repository = ({ repository }) =>
  (
    <div>
      <p>
        <strong>In Repository:</strong>
        <a href={repository.url}>{`${repository.name}`}</a>
      </p>
      {repository.issues.edges.map(issue =>
        <Stacked>
          <a href={issue.node.url}>{issue.node.title}</a>
        </Stacked>
      )}
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
