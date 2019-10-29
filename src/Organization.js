import React from 'react'
import Repository from './Repository';

const Organization = ({ organization, errors }) => {

  if (errors) return (
    <div>
      <p>Mistakes happen. Here is one, or several:</p>
      {errors.map(error => error.message).join(' ')}
    </div>
  )
  return (
    <div>
      <p>
        <strong>{`Issues from Organization: `}</strong>
        <a href={organization.url}>{`${organization.name}`}</a>
      </p>
      <Repository repository={organization.repository} />
    </div>
  )
}

export default Organization;
