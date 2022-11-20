const { User } = require('../models/User');

let auth = (req, res, next) => {
    //인증 처리 하는 곳

    //step 1: 클라이언트 쿠키에서 토큰을 가져오기
    let token = req.cookies.x_auth;
    
    //step 2: 토큰을 디코딩하고 User 찾기
    User.findByToken(token, (err, user) => {
        //step 3: 유저 존재 O > True, 유저 존재 X > False 
        if(err) throw err;
        if(!user) return res.json({isAuth: false, error: true})

        req.token = token;
        req.user = user;

        next();
    })

}

module.exports = { auth }