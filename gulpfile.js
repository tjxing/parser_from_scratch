const gulp = require('gulp')
const clean = require('gulp-clean')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const mocha = require('gulp-mocha')
const eslint = require('gulp-eslint')

gulp.task('lint', () => gulp
    .src(['src/**/*.ts', 'test/**/*.ts'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
)

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

gulp.task('test', () => gulp.src(['test/*.ts'], { read: false })
    .pipe(mocha({
        reporter: 'spec',
        require: ['ts-node/register']
    }))
)

gulp.task('default', gulp.series(
    gulp.parallel('lint'),
    gulp.parallel('clean'),
    gulp.parallel('build'),
    gulp.parallel('types'),
    gulp.parallel('test'))
)

gulp.task('build-only', gulp.series(
    gulp.parallel('lint'),
    gulp.parallel('clean'),
    gulp.parallel('build'),
    gulp.parallel('types'))
)