module.exports = {
    lintOnSave: false,
    publicPath: '/easy-qrcode',
    outputDir: '../dist',
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = 'Easy QRcode';
                return args;
            });
    },
};
