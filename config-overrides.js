module.exports = function override(config) {
  config.resolve.fallback = {
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "util": require.resolve("util/"),
    "zlib": require.resolve("browserify-zlib"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert/"),
    "url": require.resolve("url/"),
    "crypto": require.resolve("crypto-browserify")
  };
  
  return config;
};