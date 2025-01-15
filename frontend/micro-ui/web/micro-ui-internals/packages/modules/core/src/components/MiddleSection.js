import React from 'react';

const MiddleSection = () => {
  return (
    
      <div className="middle-section">

        <div className='middle-content'>

          <div className='middle-left-half'>
            <div className="middle-left-half-upper">
              <div className="middle-header">Latest Projects</div>

              <div className="middle-left--upper-body"></div>

                 <li><a href="https://create-react-app.dev/docs/adding-images-fonts-and-files/">Item 1</a></li>
                 <li><a href="https://create-react-app.dev/docs/adding-images-fonts-and-files/">Item 2</a></li>
                 <li><a href="https://create-react-app.dev/docs/adding-images-fonts-and-files/">Item 3</a></li>
                 <li><a href="https://create-react-app.dev/docs/adding-images-fonts-and-files/">Item 4</a></li>
                

            </div>
            <div className='middle-left-half-lower'>
              <div className="middle-header">Photo Gallery</div>

              <div className="middle-left--lower-body"></div>

            </div>
          </div>
          <div className='middle-right-half'>
              <div className="middle-header">News Highlights</div>
              <div className="middle-right-body"></div>
          </div>

        </div>

      </div>
    
  );
};

export default MiddleSection;