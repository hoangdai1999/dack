module.exports = function logout(req,res){
    delete req.session.userId;
    return res.redirect('/');
};