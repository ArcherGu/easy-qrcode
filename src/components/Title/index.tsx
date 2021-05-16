import React from "react";
import logo from "../../assets/logo_2.png";
import "./index.css";

const Title = () => {
    return (
        <div className="title">
            <img
                alt="Easy QRcode"
                src={logo}
                className="logo"
            />
            Easy-QRcode
            <small className="version">0.1.0</small>
        </div>
    )
}

export default Title;