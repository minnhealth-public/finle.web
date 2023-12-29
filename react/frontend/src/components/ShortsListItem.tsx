import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import React from 'react'
import { Link } from 'react-router-dom'
import { Video } from '../models'

const ShortsListItem: React.FC<Video> = ({id, name, description}) => {
  return (
    <Link to={`/shorts/${id}`}>
      <div className="p-3 m-3 short-wrapper">
        <div className="col-lg-7 p-3 flex-display">
          <div className="youtube-icon-wrapper">
            <FontAwesomeIcon icon={faYoutube} className="p-3"/>
          </div>
          <div className="thumbnail-description">
            <h4 className="header">{ name }</h4>
            <hr />
            <p>{ description }</p>
          </div>
        </div>
        <div className="col-lg-4 thumbnail">
          <img src={`http://img.youtube.com/vi/${ id }/mqdefault.jpg`} alt={name}/>
        </div>
      </div>
    </Link>
  )
}

export default ShortsListItem
