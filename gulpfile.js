"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
// var webp = require("gulp-webp");
// var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var htmlmin = require("gulp-htmlmin");
var uglify = require("gulp-uglify");
var pump = require("pump");
var include = require("posthtml-include");
var run = require("run-sequence");
var del = require("del");
var server = require("browser-sync").create();

gulp.task("style", function() {
  gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

gulp.task("serve", function() {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("source/*.html", ["html"]).on("change", server.reload);
});

gulp.task("images", function() {
  return gulp.src(["source/img/**/*.{png,jpg,svg}", "!source/img/sprite.svg"])
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function() {
  return gulp.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

// gulp.task("sprite", function() {
//   return gulp.src("source/img/sp-*.svg")
//     .pipe(svgstore({
//       inLineSvg: true
//     }))
//     .pipe(rename("sprite.svg"))
//     .pipe(gulp.dest("build/img"));
// });

gulp.task("html", function() {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build"));
});

gulp.task("compress", function (cb) {
  pump([
    gulp.src("source/js/*.js"),
    uglify(),
    rename({suffix: ".min"}),
    gulp.dest("build/js")
  ],
    cb
  );
});

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "style",
    "compress",
    "images",
    "webp",
    // "sprite",
    "html",
     done
  );
});

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});
