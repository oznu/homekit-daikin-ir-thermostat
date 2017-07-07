'use strict'

const gulp = require('gulp')
const nodemon = require('gulp-nodemon')

const paths = {
  server: 'bin/www',
  serverIgnore: [
    'html/*',
    'gulpfile.js'
  ]
}

gulp.task('default', ['app'], () => {
})

gulp.task('app', () => {
  return nodemon({
    script: paths.server,
    ext: 'html js',
    ignore: paths.serverIgnore
  }).on('restart', () => {})
})
