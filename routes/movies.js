const router = require("express").Router();
const Movie = require("../models/Movie");
const verify = require("../verifyToken");

//create movie
router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newMovie = new Movie(req.body);
    try {
      const savedMovie = await newMovie.save();
      res.status(200).json(savedMovie);
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(500).json("you are not allowed");
  }
});

//update movie
router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updateMovie = await Movie.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updateMovie);
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(500).json("you are not allowed");
  }
});

//delete movie
router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await Movie.findByIdAndDelete(req.params.id);
      res.status(200).json("the movie hasbeen deleted");
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(500).json("you are not allowed");
  }
});

//get movie
router.get("/find/:id", verify, async (req, res) => {
  // console.log(req.params.id)
  try {
    const movie = await Movie.findById(req.params.id);
    // console.log(movie)
    res.status(200).json(movie);
  } catch (err) {
    res.status(403).json(err);
  }
});

//random movie

router.get("/random", verify, async (req, res) => {
  const type = req.query.type;
  let movie;
  
  try {
    if (type === "series") {
      movie = await Movie.aggregate([
        { $match: { isSeries: true } },
        { $sample: { size: 1 } },
      ]);
    } else {
      movie = await Movie.aggregate([
        { $match: { isSeries: false } },
        { $sample: { size: 1 } },
      ]);
    }
    res.status(200).json(movie)
  } catch (err) {
    res.status(403).json(err);
  }
});

router.get("/", verify, async (req,res)=>{
  if(req.user.isAdmin){
    try{
const allMovies = await Movie.find()
res.status(200).json(allMovies.reverse())
    }catch(err){
      res.status(403).json(err)
    }

  }else{
    res.status(500).json('you are not authenticate')
  }
})

module.exports = router;
