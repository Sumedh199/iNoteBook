const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Notes");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");

//route 1: get all notes using get "/api/auth/getuser"  login requried

router.get("/fetchallnotes", fetchuser, async (req, res) => {

    try {
    
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }    
});

//route2 :add a new note using post "/api/auth/add note"  login requried

router.post("/addnote",fetchuser,
  [
    body("title", "enter a valid title").isLength({ min: 3 }),
    body("description", "must contain atleast 5 char").isLength({ min: 3 }),
  ],
  async (req, res) => {
    //if there are error return bad request

        try {
    const {title,description,tag}=req.body    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const note =new Notes({
        title,description,tag,user:req.user.id
    })
    const saveNote=await note.save()
    res.json(saveNote);
    
} catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
            
}

  });

  //route3 :update an existing note using put "/api/auth/updatenote"  login requried

router.put("/updatenote/:id",fetchuser,async (req, res) => {
    const {title,description,tag}=req.body;
    //Create a newNote object 
    const newNote = {}
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    //find the note to be update and update it
    let note = await Notes.findById(req.params.id);
    if (!note){
        return res.status(400).send("not found")
    }
    
    if(note.user.toString()!== req.user.id){

            return res.status(401).send("not allowed")
    }

    note= await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note})

    })
  //route 4 :DELETE an existing note using DELETE "/api/NOTES/DELETENOTE"  login requried

router.delete("/deletenote/:id",fetchuser,async (req, res) => {
  const {title,description,tag}=req.body;
 
  //find the note to be delete and delete it
  let note = await Notes.findById(req.params.id);
  if (!note){
      return res.status(400).send("not found")
  }

  //allow deletion only if user owns the note
  if(note.user.toString()!== req.user.id){

     return res.status(401).send("not allowed")
  }

  note= await Notes.findByIdAndDelete(req.params.id)
  res.json({"success":"note has been deleted",note:note});
})


module.exports = router;
