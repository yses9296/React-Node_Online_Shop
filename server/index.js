const express = require('express')
const app = express()
const port = 4000

const config = require('./config/key');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

//application/x-www-form-urlencoded 분석
app.use(bodyParser.urlencoded({extended: true})); 

//application/json 분석
app.use(bodyParser.json()); 
app.use(cookieParser());

//mongoDB connection - mongoose
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI)
.then( ()=> console.log('MongoDB Connected..')) //MongoDB Connection Succeed
.catch( err => console.log(err))                //MongoDB Connection Failed


//test init
app.get('/', (req, res) => {
  res.send('Hello World! This is Node with React')
})

//React JS + Node
app.get('/api/hello',(req, res) => {
  res.send('Hello You reached Node js');
})



//Register Route
const { User } = require('./models/User');

app.post('/api/users/register', (req, res) => {//회원가입에 필요한 정보들을 client에서 가져오면 그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body); //인스턴스 생성
  user.save((err, userInfo) => {
    if(err) return res.json( {success: false, err})
    return res.status(200).json({
      success: true
    })
  });
})//Register Route


//Login Route
app.post('/api/users/login', (req, res) => {
 
  //step 1: 요청된 이메일을 데이터베이스에서 찾는다.
  User.findOne({ email: req.body.email} , (err, userInfo) => {

    if(!userInfo) {
      return res.json({loginSuccess: false, message: "존재하지 않는 이메일입니다."})
    }

    //step 2: 요청한 email가 존재한다면 비밀번호가 같은지 확인
    userInfo.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
        return res.json({loginSuccess: false, message: "비밀번호가 일치하지 않습니다." })
      //step 3: 이메일, 비밀번호 모두 일치 시 토큰 생성
      userInfo.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        //토큰을 저장한다 (쿠키 또는 로컬스토리지에 저장 가능)
        res.cookie("x_auth", user.token)
        .status(200)
        .json({loginSuccess: true, userId: user._id})
      })

      
    })
  })
});//Login-Route


//Login - Authentication
const { auth } = require('./middleware/auth');
app.get('/api/users/auth', auth, (req, res) => {
  console.log('through middleware')

  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })

})//Login - Authentication



//Logout - Authentication
app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    {_id: req.user._id}, 
    {token: ''}, 
    (err, user) => {
      if(err) return res.json({success: false, err})
      return res.status(200).send({success: true})
    }
  )
})//Logout - Authentication



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})