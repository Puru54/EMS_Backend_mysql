const User = require('./../models/userModel')
const AppError = require('../utils/appError')
const multer = require('multer')

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/images/users')
    },
    filename: (req, file, cb)=> {
        var obj = JSON.parse(req.cookies.token)
        const ext = file.mimetype.split('/')[1]
        cb(null, `user-${obj['_id']}-${Date.now()}.${ext}`)
    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    }else {
        cb(new AppError('Not an image! Please upload only images',400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

exports.uploadUserPhoto = upload.single('photo')

exports.getAllUsers = async (req, res, next) => {
    try{
        const users = await User.findAll()
        res.status(200).json({data: users, status: 'success'})
    }catch (err) {
        res.status(500).json({error: err.message});
    }
}

exports.createUser = async (req, res) => {
    try{
        const user = await User.create(req.body);
        res.json({ data: user, status: "success"});
    }catch (err) {
        res.status(500).json({ error: err.message});
    }
}

exports.getUser = async (req, res) => {
    try{
        const user = await User.findByPk(req.params.id);
        res.json({ data: user, status: "success"});
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
}

exports.updateUser = async(req, res) => {
    try{
        const user = await User.update(req.body, {
            where: { cid: req.params.id }
        });
        res.json({ data: user, status: "success"});
    } catch (err){
        res.status(500).json({error: err.message});
    }
}

exports.deleteUser = async(req, res) => {
    try{
        await User.destroy({
            where: { cid: req.params.id }
        });
        res.json({status: "success"});
    }catch (err){
        res.status(500).json({error: err.message});
    }
}

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

exports.updateMe = async (req, res, next) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.passwordConfirm) {
            return next(
                new AppError(
                    'This route is not for password updates. Please use /updateMyPassword',400,
                ),
            )
        }
        // 2) Filtered our unwanted fields names that are not allowed to be updated
        const filteredBody=filterObj(req.body, 'name', 'email')

        if (req.body.photo !=='undefined') {
            filteredBody.photo = req.file.filename
        }

        var obj = JSON.parse(req.cookies.token)

        const updatedUser = await User.update(filteredBody, {
            where: { id: obj['id'] },
            returning: true,
            plain: true
        })
        
        res.status(200).json({
            status: 'success',
            data: { user: updatedUser[1] },
        })
    } catch (err) {
        res.status(500).json({error: err.message})
    }
}
