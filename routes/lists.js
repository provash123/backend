const router = require("express").Router();
const List = require("../models/List");
const verify = require("../verifyToken");

//create list
router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newList = new List(req.body);
    try {
      const saveList = await newList.save();
      res.status(200).json(saveList);
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(500).json("you are not authenticated");
  }
});

//delete list

router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await List.findByIdAndDelete(req.params.id);
      res.status(200).json("list item delete successfully");
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(500).json("you are not authenticated");
  }
});

//get all list

router.get("/", verify, async (req, res) => {
  const typeQuery = req.query.type;
  const genryQuery = req.query.genre;
  

  let list = [];

  try {
    if (typeQuery) {
      if (genryQuery) {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery, genre: genryQuery } },
        ]);
      } else {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery } },
        ]);
      }
     
      
    } else {
      list = await List.aggregate([{ $sample: { size: 10 } }]);
     
    }
    res.status(200).json(list)
  } catch (err) {
    res.status(403).json(err);
  }
});

module.exports = router;
