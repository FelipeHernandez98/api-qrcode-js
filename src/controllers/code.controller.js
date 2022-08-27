const { response } = require("express");
const pool = require('../database/conexion');
const { contentType, verificarType } = require("../helpers/validarType");
const { AwesomeQR } = require("awesome-qr");
const fs = require('fs');
const path = require('path')


const retornarImg = async(req, res= response) =>{
    
    const { url, user } = req.body;
    const date = new Date();

    const content = await contentType(url);
    
    const type = await verificarType(url, content);

    const logoPath = path.join(__dirname, 'logos', `${type}.png`)
    const logoImage = fs.readFileSync(logoPath);
    
    let url_code = await new AwesomeQR({
        text: url,
        size: 250,
        logoImage
    }).draw();

    url_code = 'data:image/png;base64,' + url_code.toString("base64");

    const qr_code ={
        url,
        url_code,
        user,
        type,
        date
    }

     try {
        
        await pool.query('INSERT INTO qr_code SET ?', qr_code);

        res.json({
            msg: 'Registrado con exito',
            qr_code
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'Algo salió mal'
        })
    }  
    
}

module.exports = {
    retornarImg
}