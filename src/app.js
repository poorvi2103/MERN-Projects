require("dotenv").config();                                 //sugegsted to add this at the top
const express=require("express");
const path=require("path");
const hbs=require("hbs");
require("./db/connection");
const Employee=require("./models/employee");
const bcrypt=require("bcryptjs");
const cookieParser=require("cookie-parser");         //cookie-parser works as middleware
const jwt=require("jsonwebtoken");
const auth=require("./middleware/auth");

const port=process.env.PORT || 3000;
const app=express();

const staticPath=path.join(__dirname,"../public")
const templatePath=path.join(__dirname,"../templates/views")
const partialsPath=path.join(__dirname,"../templates/partials")


app.set("view engine","hbs");                           //automatically search in views folder
app.set("views",templatePath)
hbs.registerPartials(partialsPath);

console.log(process.env.SECRET_KEY);

app.use(express.static(staticPath));    
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.render("index");
})
app.get("/registerr",(req,res)=>{       //or yha...ye bata wait
    res.render("register");
})
app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/secrets",auth ,(req,res)=>{               //added middleware auth before rendering secrets page
    console.log(`this is the cookie awesome ${req.cookies.jwt} `);              //user's valid token that we stored in a cookie and now getting it here from cookie
    res.render("secrets");
})

app.get("/logout",auth,async(req,res)=>{
    try{
        console.log(req.user);
        //The filter() method creates a new array
        //with all elements that pass the test implemented by the provided function
        
        req.user.tokens=req.user.tokens.filter((currentelement)=>{

            return currentelement.token != req.token;    //logging out  from particular device 
        })

        //logout from all devices
        //req.user.tokens=[];


        res.clearCookie("jwt");
        console.log("logged out successfully");
        await req.user.save();
        res.render("login");
    }catch(err){
            res.status(500).send(error);
    }
})
//creating employee in our db
app.post("/registerr", async (req, res) => {
    try {

        const password = req.body.pwd;
        const cpassword = req.body.confirmpwd;
        if (password === cpassword) {
            const registerEmployee = new Employee({
                firstname: req.body.fname,
                lastname: req.body.lname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword
            })
            console.log(registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part" + token);

            //the res.cookie() function is used to set the cookie name to
            //The value parameter may be string or object converted to JSON
            //syntax:
                //res.cookie(name,value,[options])


            //res.cookie("jwt",token);                    //storing token to cookie,name of cookie is jwt
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+5000),            //cookoie will expire in 5sec
                httpOnly:true,                          //http only means client side can't do anything to our cookie
                //secure:true
            });
            //console.log(cookie);
            const registered = await registerEmployee.save();
            res.status(201).render("index");
        } else {
            res.send("password are not matching")
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

//login chk
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.pwd;                                    //entered password while logging in
        //console.log(`${email} and password is ${password}`)
        const useremail = await Employee.findOne({ email: email });
        //res.send(useremail);
        //console.log(useremail);

        /* if(useremail.password===password)
         {
             res.status(201).render("index")
         }
         else{
             res.status(400).send("invalid password")
         }*/

        /*password validation using bcryptjs*/
        const isMatch = await bcrypt.compare(password, useremail.password);  //comparing entered pwd with pwd stored in db

        //adding middleware
        const token = await useremail.generateAuthToken();              //generating token
        console.log("the token part" + token);

        res.cookie("jwt",token);                                        //storing token in cookie
        //console.log("cookie is"+cookie);                          //donot work

        

        if (isMatch) {
            res.status(201).render("index")
        }
        else {
            res.status(400).send("invalid password")
        }
    }
    catch (err) {
        res.status(400).send("invalid email")
    }
})

app.get("/",(req,res)=>{
    res.send("hello world");
})

app.listen(port,()=>{
    console.log("Server is running at port no. "+port);
})


//https://basicmernapp.herokuapp.com/




