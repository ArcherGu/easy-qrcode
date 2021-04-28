import { version } from './package.json';
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import * as path from "path";

const banner = `/*!
 * easy-qrcode v${version}
 * https://github.com/ArcherGu/easy-qrcode.git
 * @license MIT
 */`;

const config = [
    {
        input: 'src/index.ts',
        output: [{
            file: 'dist/easy-qrcode.esm.js',
            format: 'es',
            banner
        }, {
            file: 'dist/easy-qrcode.common.js',
            format: 'cjs',
            banner
        }, {
            file: 'dist/easy-qrcode.js',
            format: 'umd',
            name: 'EQ',
            banner
        }],
        plugins: [
            typescript({
                tsconfig: "tsconfig.json",
            }),
            getBabelOutputPlugin({
                configFile: path.resolve(__dirname, 'babel.config.json'),
                allowAllFormats: true
            }),
        ]
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/easy-qrcode.d.ts',
            format: 'es',
            banner
        },
        plugins: [dts()],
    },
];
export default config;
