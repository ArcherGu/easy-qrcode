import React from "react";
import "./index.css";

const Introduction = () => {
    return (
        <div className="introduction">
            An <span className="link">Easy</span> QRcode package written by <span className="link">TypeScript</span>

            <p>
                <a href="https://npmjs.com/package/easy-qrcode">
                    <img
                        src="https://img.shields.io/npm/v/easy-qrcode.svg?style=flat-square"
                        alt="npm package"
                    />
                </a>
                <a
                    href="https://github.com/ArcherGu/easy-qrcode"
                    style={{marginLeft: '10px'}}
                >
                    <img
                        src="https://img.shields.io/github/checks-status/archergu/easy-qrcode/main?style=flat-square"
                        alt="checks"
                    />
                </a>

                <a
                    href="https://github.com/ArcherGu/easy-qrcode/blob/main/LICENSE"
                    style={{ marginLeft: '10px' }}
                >
                    <img
                        src="https://img.shields.io/github/license/archergu/easy-qrcode?style=flat-square"
                        alt="license"
                    />
                </a>
            </p>
        </div>
    )
}

export default Introduction;