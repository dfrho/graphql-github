import React from 'react'
import Repository from './Repository';

const Organization = ({ organization, errors, onFetchMoreIssues }) => {

  if (errors) return (
    <div>
      <p>Mistakes happen. Here is one, or several:</p>
      {errors.map(error => error.message).join(' ')}
    </div>
  )
  return (
    <div>
      <p>
        <strong>{`Showing Open Issues from Organization: `}</strong>
        <a href={organization.url}>{`${organization.name}`}</a>
      </p>
      <Repository onFetchMoreIssues={onFetchMoreIssues} repository={organization.repository} />
    </div>
  )
}

export default Organization;
