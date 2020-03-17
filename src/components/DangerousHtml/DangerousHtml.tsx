import React from 'react';

interface Props {
  data: string;
}

const DangerousHtml = ({ data }: Props) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: data,
      }}
    ></div>
  );
};

export default DangerousHtml;
