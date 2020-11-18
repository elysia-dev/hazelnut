loaders: [
    ..., {
      test: /\.(woff|woff2|eot|ttf|svg)$/,
      loader: 'file?name=fonts/[name].[ext]'
    }
  ]