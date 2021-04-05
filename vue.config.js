module.exports = {
    chainWebpack: config => {
      config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Hue Goal - Tracking Tasks Made Colorful'
        return args
      })
    }
  }