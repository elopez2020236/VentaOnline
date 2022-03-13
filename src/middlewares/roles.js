exports.verAdmin = function(req, res, next) {
    if(req.user.rol !== "ROL_ADMIN") return res.status(403).send({mensaje: "Solo puede acceder el ADMIN"})
    
    next();
}

exports.verCliente = function(req, res, next) {
    if(req.user.rol !== "ROL_CLIENTE") return res.status(403).send({mensaje: "Solo puede acceder el CLIENTE"})
    
    next();
}