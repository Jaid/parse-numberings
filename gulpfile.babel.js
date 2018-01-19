import gulp from "gulp"
import gulpBabel from "gulp-babel"
import gulpClean from "gulp-clean"
import gulpIf from "gulp-if"
import gulpSourcemaps from "gulp-sourcemaps"

const isDevelopment = process.env.NODE_ENV !== "production"

gulp.task("clean", () => gulp.src("./build/", {read: false})
    .pipe(gulpClean()))

gulp.task("babel", () => gulp.src(["./src/**/*.jsx"])
    .pipe(gulpIf(isDevelopment, gulpSourcemaps.init()))
    .pipe(gulpBabel())
    .pipe(gulpIf(isDevelopment, gulpSourcemaps.write()))
    .pipe(gulp.dest("./build/")))
