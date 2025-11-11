import React from "react";

export const CameraSvg = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    enableBackground="new 0 0 24 24"
    className={className}
    viewBox="0 0 24 24"
    fill="black"
    width="46px"
    height="42px"
  >
    <rect fill="none" height="24" width="24" />
    <path d="M3,4V1h2v3h3v2H5v3H3V6H0V4H3z M6,10V7h3V4h7l1.83,2H21c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2V10H6z M13,19c2.76,0,5-2.24,5-5s-2.24-5-5-5s-5,2.24-5,5S10.24,19,13,19z M9.8,14c0,1.77,1.43,3.2,3.2,3.2s3.2-1.43,3.2-3.2 s-1.43-3.2-3.2-3.2S9.8,12.23,9.8,14z" />
  </svg>
);

export const DeleteBtn = ({ className, onClick, fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className={className} onClick={onClick} width="18px" height="18px">
    <path d="M0 0h24v24H0V0z" fill={fill} />
    <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
  </svg>
);