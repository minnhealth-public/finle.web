import React, { useState, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface ClipRatingProps {
  shortId: string;
  currentRating: number;
}

const ClipRating: React.FC<ClipRatingProps> = ({ shortId, currentRating }) => {
  const [rating, setRating] = useState<number>(currentRating);

  useEffect(() => {
    setRating(currentRating);
  }, [currentRating]);

  // Using useCallback here to memoize the function, so it doesn't get recreated for each star with each re-render.
  const saveRating = useCallback(async (newRating: number) => {
    // await fetch(`http://localhost:8000/finle/api/shorts/${shortId}`, {
    //     method: 'PUT',
    //     headers: { 'Content-type': 'application/json'},
    //     body: JSON.stringify({user_rating: newRating})
    // }) // This is calling the backend at PUT /api/shorts/{id}
    // setRating(newRating)
    console.log(`saving short with new rating ${newRating}`);
  }, [shortId]);

  return (
    <div>
      {[1, 2, 3, 4, 5].map(val => (
        <button key={val} onClick={() => saveRating(val)} className="rating-button">
          <FontAwesomeIcon icon={faStar} className={val <= rating ? 'rating-color' : 'none'} />
        </button>
      ))}
      <p><i>How helpful was this video?</i></p>
    </div>
  );
};

export default ClipRating;
