import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CameraSvg, DeleteBtn } from "../utils/svgindex"
import { Loader } from "@mseva/digit-ui-react-components";
const MiniUpload = (props) => {
  return (
    <div className="upload-img-container">
      <CameraSvg className="upload-camera-img" />
      <input type="file" id="miniupload" accept="image/*" onChange={(e) => props.onUpload(e)} />
    </div>
  );
};

const CustomUploadImages = (props) => {
  const isMobile = window.Digit.Utils.browser.isMobile();
  if (props.thumbnails && props.thumbnails.length > 0) {
    return (
      <div className="multi-upload-wrap" style={isMobile?{display:"flex", flexDirection:"column"}:{}}>
        <style>{`
        .multi-upload-wrap {
  @apply flex mb-lg;

  div {
    display: block;
    position: relative;
    background-color: #fafafa;
    width: calc((100% - 16px) / 4);
    margin-right: 8px;

    .delete {
      position: absolute;
      height: 24px;
      width: 24px;
      border-radius: 100%;
      top: 2px;
      right: 2px;
    }
  }

  .upload-img-container {
    border: 1px dashed #d6d5d4;
    margin: 0 !important;

    img {
      margin-left: auto;
      margin-right: auto;
      padding-top: calc(33% - 21px);
    }

    svg {
      @apply flex;
      margin: auto;
    }

    svg {
      margin-left: auto;
      margin-right: auto;
      top: calc(50% - 21px);
      position: relative;
    }

    input {
      @apply absolute w-full h-full opacity-0 top-0;
    }
  }
}

@media (max-width: 768px) {
  .multi-upload-wrap {
    display: flex;
    flex-direction: column;
    gap: 20px
  }

  .multi-upload-wrap div {
    width: 100%;
    margin-right: 0;
    margin-bottom: 8px; /* optional spacing between items */
  }
}
        `}</style>
        {props.thumbnails.map((thumbnail, index) => {
          return (
            <div key={index}>
              <DeleteBtn onClick={() => props.onDelete(index)} className="delete" fill="#d4351c" />
              <img src={thumbnail} alt="uploaded thumbnail" />
              <h1>{props?.t("SITE_IMAGE_"+(index+1))}</h1>
            </div>
          );
        })}
        {(props.thumbnails.length < 4 && !props?.isFileUploading)? <MiniUpload onUpload={props.onUpload} /> : null}
        {props?.isFileUploading && <Loader />}
      </div>
    );
  } else {
    return (
      <div>
      {props?.isFileUploading? <Loader /> :<div className="upload-wrap" onClick={(e) => props.onUpload(e)}>
        <CameraSvg />
        <input type="file" id="upload" accept="image/*" onChange={(e) => props.onUpload(e)} />
      </div>}
      </div>
    );
  }
};


export default CustomUploadImages;
