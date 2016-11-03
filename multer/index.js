const TEMP_DIR_SHP = './public/uploads/shapefiles';

const multer = require('multer');
const path = require('path');
const bluebird = require('bluebird');
const fs = require('fs');

const unlink = bluebird.promisify(fs.unlink);
const removeFiles = (...files)=> Promise.all(files.map(path => unlink(path) ));

const multerOpts = (dest, filename, fileSize) => ({
    limits: {
        fileSize
    },
    storage: multer.diskStorage({
        destination: function(req, file, cb){
            console.log('destttttttttttt' + dest);
            cb(null, dest);
        },
        filename
    })
});

const createMulter = (dest, filename, fileSize) =>
    multer(multerOpts(dest, filename, fileSize));

const fileNameSHP = (req, file, cb)=>{
	cb(null, file.originalname);
};

module.exports = {
    createMulter,
    fileNameSHP,
    removeFiles,
    TEMP_DIR_SHP
}
