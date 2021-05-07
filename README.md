<p align="center">
    <img width="200" src="https://github.com/ArcherGu/easy-qrcode/blob/main/logo.png" alt="logo">
</p>
<br/>
<p align="center">
    <a href="https://npmjs.com/package/easy-qrcode">
        <img src="https://img.shields.io/npm/v/easy-qrcode.svg?style=flat-square" alt="npm package">
    </a>
    <a href="https://github.com/ArcherGu/easy-qrcode">
        <img src="https://img.shields.io/github/checks-status/archergu/easy-qrcode/main?style=flat-square" alt="checks">
    </a>
    <a href="https://github.com/ArcherGu/easy-qrcode/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/archergu/easy-qrcode?style=flat-square" alt="license">
    </a>
</p>

# Easy QRcode 📱

An Easy QRcode package written by TypeScript. This package can generate QR codes manually or automatically based on content. Thank you for using it. 😊

### 🚀[Demo](https://archergu.github.io/easy-qrcode)

## 1. Quick start

### Install

#### Install with NPM or Yarn

```bash
# npm
npm install --save easy-qrcode
# yarn
yarn add --save easy-qrcode
```

#### Or link to the source code directly

```html
<script src="dist/easy-qrcode.min.js"></script>
```

Name `EQ` is ready to use and no need to import.

#### Or CDN

```html
<script src="https://unpkg.com/easy-qrcode/dist/easy-qrcode.min.js"></script>
```

Name `EQ` is ready to use and no need to import.

## 2. How to use

### Create

`Creator` class is used to generate a boolean matrix of QR code, which is a two-dimensional matrix that represents rows and columns.
You can use some options to initialize this creator. These options are optional.

```ts
import { Creator, ErrorCorrectionLevel, MaskPattern } from 'easy-qrcode';

const qrCreator = new Creator();

// with options
const qrCreator = new Creator({
  version: 4,
  enableECI: false,
  errorCorrectionLevel: ErrorCorrectionLevel.M,
  maskPattern: MaskPattern.PATTERN000,
});
```

You can add content that will need to be written to the QR code to the creator and then generate the matrix.

```ts
import { QRContent, QRMode } from 'easy-qrcode';

// Add content directly
qrCreator.add('123');

// Add QRContent
const myContent = new QRContent('123', QRMode.Byte);
qrCreator.add(myContent);

// Add content object
qrCreator.add({
  content: '123',
  mode: QRMode.Numeric,
});

// create matrix
qrCreator.create();

const matrix = qrCreator.getMatrix();
```

You can use this matrix to render QR code or to generate image and other operations.

### Render

This package provides a basic renderer now that renders QR code onto canvas.
You can provide your own renderer for a more free experience.

```ts
import { Renderer } from 'easy-qrcode';

const qrRenderer = new Renderer();
const matrix = qrCreator.getMatrix();

// An existing canvas
const canvas = document.getElementById('qr-canvas');
qrRenderer.drawCanvas(matrix, canvas);

// create a new canvas
const canvas = qrRenderer.drawCanvas(matrix);
document.body.append(canvas);
```

## 3. Documentation

You can find documentation [here](https://archergu.github.io/easy-qrcode/docs).

## 4. Why

The most direct way to understand a standard or algorithm is to practice it. I was learning some details about QR code, and when I read some documentation I decided to implement a package.

In fact, this package was not created out of thin air. During the creation process I referred to some other developer projects, and I am very grateful for the ideas they provide

- [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
- [soldair/node-qrcode](https://github.com/soldair/node-qrcode)
- [nuintun/qrcode](https://github.com/nuintun/qrcode)
- [gera2ld/qrcanvas](https://github.com/gera2ld/qrcanvas)

## License

The code in this project is licensed under [MIT license](https://github.com/ArcherGu/easy-qrcode/blob/main/LICENSE).
