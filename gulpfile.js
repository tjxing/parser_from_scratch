const gulp = require('gulp')
const clean = require('gulp-clean')
const replace = require('gulp-replace')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const mocha = require('gulp-mocha')

gulp.task('clean', () => gulp
    .src('dist', { read: true, allowEmpty: true })
    .pipe(clean('dist'))
)

gulp.task('build', () => tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('dist'))
)

gulp.task('types', () => tsProject.src()
    .pipe(tsProject())
    .dts.pipe(gulp.dest('dist'))
)

gulp.task('clean-temp', () => gulp
    .src('temp', { read: true, allowEmpty: true })
    .pipe(clean('temp'))
)

gulp.task('replace', () => gulp.src(['test/*.ts'])
    .pipe(replace(
        /import (.*) from \'..\/src\/(.*)\'/g,
        "import $1 from '../dist/$2'"
    ))
    .pipe(gulp.dest('temp/'))
)

gulp.task('test', () => gulp.src(['temp/*.ts'], { read: false })
    .pipe(mocha({
        reporter: 'spec',
        require: ['ts-node/register']
    }))
)

gulp.task('default', gulp.series(
    gulp.parallel('clean'),
    gulp.parallel('build'),
    gulp.parallel('types'),
    gulp.parallel('clean-temp'),
    gulp.parallel('replace'),
    gulp.parallel('test'),
    gulp.parallel('clean-temp'))
)

gulp.task('build-only', gulp.series(
    gulp.parallel('clean'),
    gulp.parallel('build'),
    gulp.parallel('types'))
)

gulp.task('unittest', () => gulp.src(['test/*.ts'], { read: false })
    .pipe(mocha({
        reporter: 'spec',
        require: ['ts-node/register']
    }))
)