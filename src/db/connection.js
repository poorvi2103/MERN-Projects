const mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/youtubeRegistration",
{useCreateIndex:true,
useFindAndModify:false,
useUnifiedTopology:true,
useNewUrlParser: true
}).then(()=>{
    console.log("connection successful")
}).catch((e)=>{console.log("no connection")})