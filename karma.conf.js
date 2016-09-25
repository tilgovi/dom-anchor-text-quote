module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    browserify: {debug: true, transform: ['babelify']},
    frameworks: ['browserify', 'chai', 'fixture', 'mocha'],
    files: [
      'test/*.js',
      'test/fixtures/*.html'
    ],
    preprocessors: {
      'test/*.js': ['browserify'],
      'test/fixtures/*.html': ['html2js']
    },
    reporters: ['progress', 'coverage'].concat(
      (process.env.COVERALLS_REPO_TOKEN ? ['coveralls'] : [])),
    coverageReporter: {
      reporters: [
        {type: 'html', subdir: '.'},
        {type: 'json', subdir: '.'},
        {type: 'lcovonly', subdir: '.'},
        {type: 'text', subdir: '.'}
      ]
    }
  })
}
