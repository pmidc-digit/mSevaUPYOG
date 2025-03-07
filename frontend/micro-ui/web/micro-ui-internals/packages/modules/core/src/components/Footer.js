import React from "react";

const Footer = () => {
  const styles = {
    footerTop: {
      backgroundColor: "#F5FBFF",
      width: "100%",
      minHeight: "100px",
      padding: "20px 60px 60px 60px",
      display: "flex",
      flexWrap: "wrap",
     justifyContent: "space-between",
    },

    image: {
      flex: '1 1 30%',
      maxWidth: '13%',
      margin: '5px',
   },

   '@media (min-width: 768px)': {
        footerTop: {
            flexWrap: 'nowrap',
        },
        image: {
            flex: '1',
            maxWidth: '10%',
        },
    },
  }

  

  return (
    <div className="footer-body" style={{ width: "100%", position: "relative", bottom: 0, backgroundColor: "#152265", textAlign: "center" }}>
      <div className="footer-top" style={styles.footerTop}>
        
          <img src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/nic%20image.png" alt="nic"  style={styles.image}/>
          <img src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/myGov%20image.png" alt="myGov"  style={styles.image}/>
          <img src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/data%20gov%20image.png" alt="dataGov" style={styles.image}/>
          <img src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/digital%20india%20image.png" alt="digitalIndia" style={styles.image} />
          <img src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/gem%20image.png" alt="gemIndia" style={styles.image} />
          <img src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/india%20gov%20image.png" alt="indiaGov" style={styles.image}/>
          <img src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/meity%20image.png" alt="meity" style={styles.image}/>
       
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-first">
          <h2>Punjab Municipal Bhawan</h2>
          <h2>3, Dakshin Marg, 35A,</h2>
          <h2>Chandigarh, 160022</h2>
          <h2>Mail : pgrs.lg@punjab.gov.in</h2>
        </div>
        <div className="footer-bottom-second">
          <h1>LINKS</h1>
          <ul>
            <li>
              <a href="#item1">Privacy Policy</a>
            </li>
            <li>
              <a href="#item2">Disclaimer</a>
            </li>
            <li>
              <a href="#item3">Help</a>
            </li>
            <li>
              <a href="#item4">Terms & Conditions</a>
            </li>
            <li>
              <a href="#item5">Accessibility Statement</a>
            </li>
            <li>
              <a href="#item6">Copyright Policy</a>
            </li>
            <li>
              <a href="#item7">Contact Us</a>
            </li>
          </ul>
        </div>
        <div className="footer-bottom-third">
          <h1>IMPORTANT LINKS</h1>
          <ul>
            <li>
              <a href="#item1">Menu 1</a>
            </li>
            <li>
              <a href="#item2">Menu 2</a>
            </li>
            <li>
              <a href="#item3">Menu 3</a>
            </li>
            <li>
              <a href="#item4">Menu 4</a>
            </li>
          </ul>
        </div>
        <div className="footer-bottom-fourth">
          <h1>EXTERNAL WEBSITES</h1>
          <ul>
            <li>
              <a href="#item1">Menu 1</a>
            </li>
            <li>
              <a href="#item2">Menu 2</a>
            </li>
            <li>
              <a href="#item3">Menu 3</a>
            </li>
            <li>
              <a href="#item4">Menu 4</a>
            </li>
          </ul>
        </div>
      </div>
      {/* <div style={{backgroundColor:'#294A97', width:'100%',minHeight:'200px'}}></div> */}
      <div style={{ display: "flex", justifyContent: "center", color: "white" }}>
        <span
          style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px", fontWeight: "400" }}
          onClick={() => {
            window.open("https://www.digit.org/", "_blank").focus();
          }}
        >
          Powered by DIGIT
        </span>
        <span style={{ margin: "0 10px", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px" }}>|</span>
        <a
          style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px", fontWeight: "400" }}
          href="#"
          target="_blank"
        >
          UPYOG License
        </a>

        <span className="upyog-copyright-footer" style={{ margin: "0 10px", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px" }}>
          |
        </span>
        <span
          className="upyog-copyright-footer"
          style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px", fontWeight: "400" }}
          onClick={() => {
            window.open("", "_blank").focus();
          }}
        >
          Copyright © {new Date().getFullYear()} -
        </span>

        {/* <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a> */}
      </div>
      {/* <div className="upyog-copyright-footer-web">
        <span className="" style={{ cursor: "pointer", fontSize:  window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} onClick={() => { window.open('', '_blank').focus();}} >Copyright © {new Date().getFullYear()} -</span>
      </div> */}
    </div>
  );
};

export default Footer;
