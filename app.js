const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
let alert = require("alert");
// var flash = require("express-flash");

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

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

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

app.get("/admin", function (req, res) {
  res.render("admin");
});

app.get("/user-login", function (req, res) {
  res.render("user-login");
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
    res.render("compose");
  }
  else if (option == 2) {
    Post.find({}, function (err, posts) {
      res.render("update", {
        posts: posts,
      });
    }).sort({ _id: -1 });
  } else if (option == 3) {
    res.render("register");
  } else if (option == 4) {
    isAuthenticated = true;
    User.find({}, function (err, users) {
      res.render("delete-users", {
        users: users,
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

app.get("delete-users", function (req, res) {
  if (isAuthenticated) {
    User.find({}, function (err, users) {
      res.render("delete-users", {
        users: users,
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

app.post("/register", async (req, res) => {
  try {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
      });

      await user.save(function (err) {
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

app.post("/user-login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({ username });
  if (!user) {
    res.render("error");
  }
  if (await password === user.password) {
      isAuthenticated = true;
      res.render("compose");
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

app.get("/delete/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.deleteOne({ _id: requestedPostId }, function (err, post) {
    res.redirect("/");
  });
});

app.get("/delete/:userId", function (req, res) {
  const requestedUserId = req.params.username;

  User.deleteOne({ _id: requestedUserId }, function (err, user) {
    res.redirect("/admin");
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
