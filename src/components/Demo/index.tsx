import React, { useEffect, useRef, useState } from "react";
import {
    Creator,
    CreatorOptions,
    QRMode,
    QRMatrix,
    ErrorCorrectionLevel,
    MaskPattern,
    QRStyle,
    RenderOptions,
    Renderer,
} from 'easy-qrcode';
import Slider, { createSliderWithTooltip } from "rc-slider";
import 'rc-slider/assets/index.css';
import "./index.css";

const SliderWithTooltip = createSliderWithTooltip(Slider);

const debounce = (func: Function, wait: number, immediate: boolean = false) => {
    let timeout: any;
    return () => {
        const later = () => {
            timeout = null;
            if (!immediate) {
                func();
            }
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func();
        }
    };
};

const Demo = () => {
    const [content, setContent] = useState('Hello, QR code');
    const [size, setSize] = useState(250);
    const [style, setStyle] = useState('');
    const [styleValue, setStyleValue] = useState(0.5);
    const [errorCorrectionLevel, setErrorCorrectionLevel] = useState(ErrorCorrectionLevel.M);
    const canvasRef = useRef<any>();

    const qrStyles = [
        {
            name: 'Normal',
            value: '',
        },
        {
            name: 'Smooth',
            value: 'smooth',
        },
        {
            name: 'Radius',
            value: 'radius',
        }
    ];

    const errorCorrectionLevels = [
        {
            name: 'Low',
            value: ErrorCorrectionLevel.L,
        },
        {
            name: 'Medium',
            value: ErrorCorrectionLevel.M,
        },
        {
            name: 'Quartile',
            value: ErrorCorrectionLevel.Q,
        },
        {
            name: 'High',
            value: ErrorCorrectionLevel.H,
        },
    ];

    const qrRenderer = new Renderer({
        size: size,
        resize: true,
    });

    const drawQRcode = () => {
        if (!canvasRef.current) {
            return;
        }

        const qrCreator = new Creator({
            errorCorrectionLevel: errorCorrectionLevel,
        });
        const qrMatrix = qrCreator.add(content).create().getMatrix();
        const opts: RenderOptions = {
            size: size,
            style: style ? (style as QRStyle) : undefined,
            styleValue: styleValue,
            resize: true,
        };

        qrRenderer.updateOptions(opts);
        qrRenderer.drawCanvas(qrMatrix, canvasRef.current);
    };

    const updateQRcode = debounce(drawQRcode, 250);

    useEffect(() => {
        updateQRcode();
    }, [content, size, style, styleValue, errorCorrectionLevel]);

    return (
        <div className="demo">
            <div className="form">
                <div className="form-item">
                    <label
                        className="form-item-label"
                        style={{ width: '80px' }}
                    >Content: </label>
                    <div
                        className="form-item-content"
                        style={{ marginLeft: '80px' }}
                    >
                        <div className="demo-textarea">
                            <textarea
                                rows={1}
                                autoComplete="off"
                                className="demo-textarea__inner"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="form-item">
                    <label
                        className="form-item-label"
                        style={{ width: '80px' }}
                    >Size: </label>
                    <div
                        className="form-item-content demo-slider"
                        style={{ marginLeft: '80px' }}
                    >
                        <SliderWithTooltip
                            value={size}
                            min={100}
                            max={500}
                            step={1}
                            onChange={v => setSize(v)}
                            style={{ marginTop: "13px" }}
                        />
                    </div>
                </div>

                <div className="form-item">
                    <label
                        className="form-item-label"
                        style={{ width: '80px' }}
                    >Style: </label>
                    <div
                        className="form-item-content demo-radio"
                        style={{ marginLeft: '80px' }}
                    >
                        {qrStyles.map((e, i) => (
                            <label key={i}>
                                <input
                                    className="radio-type"
                                    name={e.name}
                                    type="radio"
                                    value={e.value}
                                    checked={style == e.value}
                                    onChange={e => setStyle(e.target.value)}
                                />
                                {e.name}
                            </label>
                        ))}
                    </div>
                </div>
                {style ?
                    (<div className="form-item">
                        <label
                            className="form-item-label"
                            style={{ width: '80px' }}
                        >Extent: </label>
                        <div
                            className="form-item-content demo-slider"
                            style={{ marginLeft: '80px' }}
                        >
                            <SliderWithTooltip
                                value={styleValue}
                                min={0}
                                max={1}
                                step={0.1}
                                onChange={v => setStyleValue(v)}
                                style={{ marginTop: "13px" }}
                            />
                        </div>
                    </div>) :
                    null
                }


                <div className="form-item-label-top">
                    <label className="form-item-label">Error Correction Level: </label>
                    <div
                        className="form-item-content demo-radio"
                        style={{ marginLeft: '80px' }}
                    >
                        {errorCorrectionLevels.map((e, i) => (
                            <label key={i}>
                                <input
                                    className="radio-type"
                                    name={e.name}
                                    type="radio"
                                    value={e.value}
                                    checked={errorCorrectionLevel === Number(e.value)}
                                    onChange={e => setErrorCorrectionLevel(Number(e.target.value))}
                                />
                                {e.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="qrcode-canvas">
                    <canvas ref={canvasRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default Demo;