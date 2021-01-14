import React from 'react';

interface IAlert {
  title: string;
  body: string;
}

export const Alert: React.FC<IAlert> = ({ title, body }) => (
  <div
    className="bg-dark-200 border-t-4 border-yellow-700 rounded-b text-yellow-200 px-4 py-3 shadow-md"
    role="alert"
  >
    <div className="flex">
      <div className="py-1 self-center mr-6">
        <img
          src="https://microicon-clone.vercel.app/warning/24/fefcbf"
          alt="Alert logo"
        />
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs">{body}</p>
      </div>
    </div>
  </div>
);
