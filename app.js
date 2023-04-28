const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
let alert = require("alert");
var flash = require("express-flash");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const { report } = require("process");

const aboutContent =
  "News Book TV is a News Website. This Website talks about the real news of India. Our website posts news articles that focus only on news content that connects the people living in India, we  shows you the real truth of India, and gives you a clear and true news of the country. If that sounds like it could be helpful for you, please join us!";

const app = express();
let isAuthenticated = false;
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://mumbaikasach:mumbaikasach-db@cluster0.jhcrgwl.mongodb.net/MumbaiKaSachDB",
  { useNewUrlParser: true }
);

const postSchema = {
  date: String,
  title: String,
  author: String,
  content: String,
  videoLink: String,
  imgLink: String,
};

const Post = mongoose.model("Post", postSchema);

const carousuelSchema = {
  date: String,
  imgLink: String,
};

const Carousuel = mongoose.model("Carousuel", carousuelSchema);

var date = new Date();

var day = date.getDate();
var month = date.getMonth() + 1;
var year = date.getFullYear();
var hours = date.getHours();
var minutes = date.getMinutes();
var seconds = date.getSeconds();

if (month < 10) month = "0" + month;
if (day < 10) day = "0" + day;

const reporterPostSchema = {
  date: String,
  title: String,
  author: String,
  content: String,
  links: [
    {
      type: String,
    },
  ],
};

const ReporterPost = mongoose.model("reporterPost", reporterPostSchema);

const reporterSchema = new mongoose.Schema({
  pic: String,
  fullName: String,
  id: String,
  designation: String,
  contact: String,
  email: String,
  aadhaar: String,
  address: String,
  pan: String,
  username: String,
  password: String,
});

const Reporter = new mongoose.model("Reporter", reporterSchema);

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const Admin = new mongoose.model("Admin", adminSchema);

app.get("/", function (req, res) {
  Post.find({}, function (err, posts) {
    Carousuel.find({}, function (err, festivalPosts) {
      res.render("home", {
        posts: posts,
        festivalPosts: festivalPosts,
      });
    }).sort({ _id: -1 });
  }).sort({ _id: -1 });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/admin-login", function (req, res) {
  res.render("admin-login");
});

// app.get("/admin", function (req, res) {
//   res.render("admin");
// });

app.get("/reporter-login", function (req, res) {
  res.render("reporter-login");
});

app.post("/admin-login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const admin = await Admin.findOne({ username });
  if (!admin) {
    res.render("error");
  }
  if ((await password) === admin.password) {
    isAuthenticated = true;
    res.render("admin");
  } else {
    res.render("error");
  }
});

app.post("/admin", function (req, res) {
  option = req.body.selectedOption;
  if (option == 1) {
    if (isAuthenticated) {
      ReporterPost.find({}, function (err, posts) {
        res.render("approve", {
          posts: posts,
        });
      }).sort({ _id: -1 });
    } else {
      res.render("error");
    }
  } else if (option == 2) {
    res.render("compose");
  } else if (option == 3) {
    Post.find({}, function (err, posts) {
      res.render("update-news", {
        posts: posts,
      });
    }).sort({ _id: -1 });
  } else if (option == 4) {
    Post.find({}, function (err, posts) {
      res.render("delete-news", {
        posts: posts,
      });
    }).sort({ _id: -1 });
  } else if (option == 5) {
    res.render("register");
  } else if (option == 6) {
    isAuthenticated = true;
    Reporter.find({}, function (err, reporters) {
      res.render("reporterTable", {
        reporters: reporters,
      });
    });
  } else if (option == 7) {
    Carousuel.find({}, function (err, festivalPosts) {
      res.render("carousuel-compose", {
        festivalPosts: festivalPosts,
      });
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about", { about: aboutContent });
});

// app.get("/contact", function (req, res) {
//   res.render("contact", { contact: contactContent });
// });

// app.get("/compose", function(req, res) {
//     res.render("compose");
// });

app.get("/news", function (req, res) {
  res.render("news");
});

// app.get("/update", function (req, res) {
//   if (isAuthenticated) {
//     Post.find({}, function (err, posts) {
//       res.render("update", {
//         posts: posts,
//       });
//     }).sort({ _id: -1 });
//   } else {
//     res.render("error");
//   }
// });

app.get("/delete-reporter", function (req, res) {
  if (isAuthenticated) {
    Reporter.find({}, function (err, reporters) {
      res.render("delete-reporter", {
        reporters: users,
      });
    }).sort({ _id: -1 });
  } else {
    res.render("error");
  }
});

app.post("/compose", function (req, res) {
  const post = new Post({
    date: req.body.postDate,
    title: req.body.postTitle,
    author: req.body.postAuthor,
    content: req.body.postBody,
    videoLink: req.body.postLink,
    imgLink: req.body.postImgLink,
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.post("/carousuel-compose", function (req, res) {
  const carousuel = new Carousuel({
    date: req.body.date,
    imgLink: req.body.carousuelImgLink,
  });
  carousuel.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

var today = year + "-" + month + "-" + day;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        file.originalname.replace(/\s/g, "") +
        today +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage }).array("news", 100);

app.post("/reporter-compose", upload, (req, res) => {
  let filenames = [];
  for (let i = 0; i < req.files.length; i++) {
    filenames.push(req.files[i].filename);
  }
  console.log(filenames);

  const Post = new ReporterPost({
    date: req.body.postDate,
    title: req.body.postTitle,
    author: req.body.postAuthor,
    content: req.body.postBody,
    links: filenames,
  });

  Post.save(function (err) {
    if (!err) {
      alert("Your news article has been succesfully published.");
      res.redirect("/");
    }
  });
});

app.get("/download/:link", (req, res) => {
  const link = req.params.link;
  var path = "./public/uploads/" + link;
  res.download(path);
});

app.get("/delete/:link", (req, res) => {
  const link = req.params.link;
  var path = "./public/uploads/" + link;

  fs.unlink(path, (err) => {
    if (err) {
      res.render("error");
    }
    console.log(`${path} was deleted`);
    alert("Successfully Deleted");
    res.render("admin");
  });
});

app.post("/register", async (req, res) => {
  try {
    const reporter = new Reporter({
      pic: req.body.pic,
      fullName: req.body.fullName,
      id: req.body.id,
      designation: req.body.designation,
      contact: req.body.contact,
      email: req.body.email,
      address: req.body.address,
      aadhaar: req.body.aadhaar,
      pan: req.body.pan,
      username: req.body.username,
      password: req.body.password,
    });

    await reporter.save(function (err) {
      if (!err) {
        res.render("admin");
        alert("User Successfully Created!");
      }
    });
  } catch {
    res.status(500).send();
  }
});

app.post("/edit", async function (req, res) {
  const requestedPostId = req.body.id;
  console.log(req.body);
  const post = await Post.updateOne(
    { _id: mongoose.Types.ObjectId(requestedPostId) },
    {
      date: req.body.postDate,
      title: req.body.postTitle,
      author: req.body.postAuthor,
      content: req.body.postBody,
      videoLink: req.body.postLink,
      imgLink: req.body.postImgLink,
    }
  );
  console.log(post);
  alert("Successfully Updated the news.");
  res.render("admin");
});

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      date: post.date,
      title: post.title,
      author: post.author,
      content: post.content,
      videoLink: post.videoLink,
      imgLink: post.imgLink,
    });
  });
});

app.get("/reporterID/:reporterId", function (req, res) {
  const requestedReporterId = req.params.reporterId;

  Reporter.findOne({ id: requestedReporterId }, function (err, reporter) {
    if (err) {
      console.log(err); // log the error to the console
    }
    res.render("reporterID", {
      pic: reporter.pic,
      fullName: reporter.fullName,
      id: reporter.id,
      designation: reporter.designation,
      aadhaar: reporter.aadhaar,
      email: reporter.email,
      address: reporter.address,
      contact: reporter.contact,
      pan: reporter.pan,
    });
  });
});

app.post("/reporter-login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const reporter = await Reporter.findOne({ username });
  if (!reporter) {
    res.render("error");
  }
  if ((await password) === reporter.password) {
    isAuthenticated = true;
    res.render("reporter-compose", {
      name: reporter.fullName,
    });
  } else {
    res.render("error");
  }
});

app.get("/update/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("edit", {
      id: post._id,
      date: post.date,
      title: post.title,
      author: post.author,
      content: post.content,
      videoLink: post.videoLink,
      imgLink: post.imgLink,
    });
  });
});

app.get("/approve/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  ReporterPost.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("approve-compose", {
      timestamp: post.timestamp,
      id: post._id,
      date: post.date,
      title: post.title,
      author: post.author,
      content: post.content,
      links: post.links,
    });
  });
});

app.get("/delete-news/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.deleteOne({ _id: requestedPostId }, function (err, post) {
    alert("Successfully Deleted.");
    res.render("admin");
  });
});

app.get("/delete-reporter-news/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  ReporterPost.deleteOne({ _id: requestedPostId }, function (err, post) {
    alert("Successfully Deleted");
    res.render("admin");
  });
});

app.get("/delete-festival-post/:festivalPostId", function (req, res) {
  const requestedFestivalPostId = req.params.festivalPostId;

  Carousuel.deleteOne(
    { _id: requestedFestivalPostId },
    function (err, festivalPost) {
      alert("Successfully Deleted Festival Post");
      res.render("admin");
    }
  );
});

app.get("/delete/:userId", function (req, res) {
  const requestedUserId = req.params.username;

  User.deleteOne({ _id: requestedUserId }, function (err, user) {
    res.redirect("/admin");
    alert("Successfully Deleted User.");
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
