import React from 'react';

interface Props {}

const RatingsLegend = (props: Props) => {
  return (
    <div className="dnd-body text-xs">
      <div className="flex items-center mt-1">
        <img
          src={`${process.env.PUBLIC_URL}/img/icons/4stars.svg`}
          alt="4 star"
          className="rating-icon w-5 h-5 mr-2"
        />
        <div className="rating-4 mr-1 font-bold">Blue</div>
        <div>
          Fantastic options, often essential to the function of your character.
        </div>
      </div>
      <div className="flex items-center mt-1">
        <img
          src={`${process.env.PUBLIC_URL}/img/icons/3stars.svg`}
          alt="3 star"
          className="rating-icon w-5 h-5 mr-2"
        />
        <div className="rating-3 mr-1 font-bold">Green</div>
        <div>Good options in almost any situation.</div>
      </div>
      <div className="flex items-center mt-1">
        <img
          src={`${process.env.PUBLIC_URL}/img/icons/2stars.svg`}
          alt="2 star"
          className="rating-icon w-5 h-5 mr-2"
        />
        <div className="rating-2 mr-1 font-bold">Gray</div>
        <div>Decent options, par for the course. Not great, not terrible.</div>
      </div>
      <div className="flex items-center mt-1">
        <img
          src={`${process.env.PUBLIC_URL}/img/icons/1stars.svg`}
          alt="1 star"
          className="rating-icon w-5 h-5 mr-2"
        />
        <div className="rating-1 mr-1 font-bold">Orange</div>
        <div>Bad options, or somewhat useful in rare circumstances.</div>
      </div>
      <div className="flex items-center mt-1">
        <img
          src={`${process.env.PUBLIC_URL}/img/icons/0stars.svg`}
          alt="0 star"
          className="rating-icon w-5 h-5 mr-2"
        />
        <div className="rating-0 mr-1 font-bold">Red</div>
        <div>Horrible, useless options, or extremely situational.</div>
      </div>
    </div>
  );
};

export default RatingsLegend;
