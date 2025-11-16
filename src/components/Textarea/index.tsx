'use client';

import { useRef } from 'react';

const TextAreaCssStyles = {
  fieldSizing: 'content',

  minHeight: '50px',
  maxHeight: '200px',
  width: '300px',
  padding: '10px',
  border: '1px solid #999',

  resize: 'none',
} as React.CSSProperties;

export const TextAreaCss = () => {
  return <textarea style={TextAreaCssStyles} placeholder="Wright what you want."></textarea>;
};

const TextAreaDivStyle = {
  minHeight: '50px',
  width: '300px',
  border: '1px solid #999',
  padding: '10px',
} as React.CSSProperties;

export const TextAreaDiv = () => {
  return (
    <div style={TextAreaDivStyle} contentEditable="true">
      Wright what you want.
    </div>
  );
};

const TextAreaJsStyle = {
  width: '300px',
  minHeight: '50px',
  resize: 'none',
  overflowY: 'hidden',
  padding: '10px',
  border: '1px solid #999',
} as React.CSSProperties;

export const TextAreaJs = () => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const autoResize = () => {
    if (!ref.current) return;
    ref.current.style.height = 'auto'; // reset height
    ref.current.style.height = ref.current.scrollHeight + 'px'; // set new one
  };

  return (
    <textarea
      ref={ref}
      onChange={autoResize}
      style={TextAreaJsStyle}
      placeholder="Wright what you want."
    ></textarea>
  );
};
