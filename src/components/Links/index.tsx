import React from "react";
import "./index.css";

const Links = () => {
    return (
        <div className="links">
            <a
                href="https://github.com/ArcherGu/easy-qrcode"
                target="_BLANK"
                className="links-button button--large button--secondary button--github"
            >View on GitHub</a>
            <a
                href="/easy-qrcode/docs"
                className="links-button button--large"
            >Documentation</a>
        </div>
    )
}

export default Links;