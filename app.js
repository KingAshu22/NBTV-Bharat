const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
let alert = require("alert");
var flash = require("express-flash");

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

const reporterPostSchema = {
  date: String,
  title: String,
  author: String,
  content: String,
  links: String
};

const reporterPost = mongoose.model("reporterPost", reporterPostSchema);

const reporterSchema = new mongoose.Schema({
  pic: String,
  fullName: String,
  id: String,
  designation: String,
  contact: String,
  aadhaar: String,
  username: String,
  password: String,
});

const Reporter = new mongoose.model("Reporter", reporterSchema);

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Admin = new mongoose.model("Admin", adminSchema);

app.get("/", function (req, res) {
  Post.find({}, function (err, posts) {
    res.render("home", {
      posts: posts,
    });
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
      reporterPost
        .find({}, function (err, posts) {
          res.render("approve", {
            posts: posts,
          });
        })
        .sort({ _id: -1 });
    } else {
      res.render("error");
    }
  }
  else if (option == 2) {
    res.render("compose");
  }
  else if (option == 3) {
    Post.find({}, function (err, posts) {
      res.render("update", {
        posts: posts,
      });
    }).sort({ _id: -1 });
  } else if (option == 4) {
    res.render("register");
  } else if (option == 5) {
    isAuthenticated = true;
    Reporter.find({}, function (err, reporters) {
      res.render("reporterTable", {
        reporters: reporters,
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

app.get("/update", function (req, res) {
  if (isAuthenticated) {
    Post.find({}, function (err, posts) {
      res.render("update", {
        posts: posts,
      });
    }).sort({ _id: -1 });
  } else {
    res.render("error");
  }
});

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

app.post("/reporter-compose", function (req, res) {
  const Post = new reporterPost({
    date: req.body.postDate,
    title: req.body.postTitle,
    author: req.body.postAuthor,
    content: req.body.postBody,
    links: req.body.links
  });

  Post.save(function (err) {
    if (!err) {
      alert("Your news article has been succesfully published.");
      res.redirect("/");
    }
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
        aadhaar: req.body.aadhaar,
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

app.post("/edit", function (req, res) {
  Post.updateMany(
    { _id: req.body.id },
    {
      date: req.body.postDate,
      title: req.body.postTitle,
      author: req.body.postAuthor,
      content: req.body.postBody,
      videoLink: req.body.postLink,
      imgLink: req.body.postImgLink,
    }
  );
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

app.get("/reporterData/:reporterId", function (req, res) {
  const requestedReporterId = req.params._id;

  Reporter.findOne({ _id: requestedReporterId }, function (err, reporter) {
    res.render("reporter", {
      pic: reporter.pic,
      fullName: reporter.fullName,
      id: reporter.id,
      designation: reporter.designation,
      aadhaar: reporter.aadhaar,
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
  if (await password === reporter.password) {
      isAuthenticated = true;
      res.render("reporter-compose", {
        name: reporter.fullName
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

  reporterPost.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("approve-compose", {
      id: post._id,
      date: post.date,
      title: post.title,
      author: post.author,
      content: post.content,
      links: post.links
    });
  });
});

app.get("/delete/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.deleteOne({ _id: requestedPostId }, function (err, post) {
    alert("Successfully Deleted.")
  });
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
