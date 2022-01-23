import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import React from "react";

export default function FooterHeaderLayout(props){
    return(
      <>
        <Header/>
          <div className="Layout--content">
            {props.children}
          </div>
        <Footer/>
      </>
    );
}