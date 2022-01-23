import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./FooterHeaderWithMarginsLayout.css"
import React from "react";

export default function FooterHeaderWithMarginsLayout(props){
    return(
        <div className="FooterHeaderWithMarginsLayout">
            <Header/>
                <div className="Layout--content">
                    {props.children}
                </div>
            <Footer/>
        </div>
    );
}