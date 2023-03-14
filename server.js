const express = require('express')
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3500
const {logger} = require('./middleware/logEvents')
const errrorHandler = require('./middleware/errorHandler')
const cors = require('cors')
const corsOption = require("./config/corsOption")
const verifyJWT = require("./middleware/verifyJWT")
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials')

//custom middleware logger
app.use(logger)

//handle options credentials check - before CORS!
//and fetch cookies credentials requirement
app.use(credentials);

// ----------------------------------------------------------------------------------------------------------------------------------------- //

//cross origin resource sharing
app.use(cors(corsOption))


// ----------------------------------------------------------------------------------------------------------------------------------------- //

//built-in middleware to handle urlencoded data
// in other words form data
// 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({extended:false}))

// built-in middleware for json
app.use(express.json())

//middleware for cookies
app.use(cookieParser());

//serve static file
app.use(express.static(path.join(__dirname, '/public')))
// '/' default
app.use('/subdir', express.static(path.join(__dirname, '/public')))

app.use('/',require('./routes/root'))
app.use('/register',require('./routes/register'))
app.use('/auth',require('./routes/auth'))
app.use('/subdir', require('./routes/subdir'))
app.use('/refresh' ,require('./routes/refresh'))
app.use('/logout' ,require('./routes/logout'))

//below routes are protected
app.use(verifyJWT);
app.use('/employee', require('./routes/api/employee'))

// kind of middleware
// const one = (req,res,next)=>{
//     console.log('one')
//     next()
// }
// const two = (req,res,next)=>{
//     console.log('two')
//     next()
// }
// const three = (req,res)=>{
//     console.log('three')
//     res.send('finished')
// }

// app.get('/chain(.html)?', [one, two, three])

// ----------------------------------------------------------------------------------------------------------------------------------------- //

// setting up routes
// app.get('^/$|/index(.html)?',(req,res)=>{
//     res.sendFile(path.join(__dirname,'views','index.html'))
// })
// app.get('/new-page(.html)?',(req,res)=>{
//     res.sendFile(path.join(__dirname,'views','new-page.html'))
// })
// app.get('/old-page(.html)?',(req,res)=>{
//     res.redirect(301, '/new-page') 
//     //302 by default
// })
// shifted to roots in routes folder 

// ----------------------------------------------------------------------------------------------------------------------------------------- //

//Routes handler
// app.get('/hello(.html)?',(req,res,next)=>{
//     console.log('attempted to load hello.html')
//     next()
// }, (req,res)=>{
//     res.send('Hello World!');
// })

// ----------------------------------------------------------------------------------------------------------------------------------------- //

//unknown Routes
app.all("*",(req,res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname,'views','404.html'))
    } else if (req.accepts('json')){
        res.json({error: "404 Not Found"});
    } else {
        res.type('.txt').send("404 Not Found");
    }
})

// ----------------------------------------------------------------------------------------------------------------------------------------- //

//custom error
app.use(errrorHandler)



//listening
app.listen(PORT, ()=>console.log(`server running on port ${PORT}`))
