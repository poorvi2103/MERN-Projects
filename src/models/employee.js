const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

const employeeSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        trim:true
    },
    lastname:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    gender:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    confirmpassword:{
        type:String,
        required:true,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

})
//generating tokens
employeeSchema.methods.generateAuthToken=async function(){
    try{
        //const token=jwt.sign({_id:this._id.toString()},"mynameispoorviagarwaljecrcfoundationjaipursitapura");
        //we should,t display our secret key bcox this generates token and if secrte key is known,token can also be known
        //so we are storing our secret key in .env file
        //and then we can add .env in gitignore
        const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        console.log(token);
        return token;

    }catch(error){
        res.send("the error part"+error);
        console.log("the error part "+error);
    }
}

//hashing for security //middleware
employeeSchema.pre("save",async function(next){                             //before save function ,this password changing funvtion will be exeecuted
                                                                            //and when next()  is called,then again save() will be called.

    if(this.isModified("password")){                                    //i.e only if paasword is modified by user
        console.log(`The current password is ${this.password}`);
        this.password=await bcrypt.hash(this.password,10);              //bcrypt 10 rounds, storing encrypted passsword in this.password
        this.confirmpassword=await bcrypt.hash(this.confirmpassword,10); 
        console.log(`The current password is ${this.password}`);

        //this.confirmpassword=undefined;
    }
    next();
})
//we are creating a new collection
const Employee=new mongoose.model("Employee",employeeSchema);

module.exports=Employee;