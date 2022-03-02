require('../models/mongooseConnection');
const Slot = require('../models/Slot');
const Util = require('./authorization');

exports.slot = async(req,res) => {
    const authorizedRoles = ["admin"]
    Util.authorization(req,res,authorizedRoles);
    const slots = await Slot.find({})
    res.render('slots/index', {title: "Home", activeNav: "slots",slots})
}

exports.addSlot = async(req,res) => {
    const authorizedRoles = ["admin"]
    Util.authorization(req,res,authorizedRoles);
    await res.render('slots/add', {title: "add-slot", activeNav: "slots", csrfToken: req.csrfToken() })
}

exports.saveSlot = async(req,res) => {
    const authorizedRoles = ["admin"]
    Util.authorization(req,res,authorizedRoles);
    const slots = await Slot.findOne({ date: new Date(req.body.date)})
    if(!slots){
        const slot = new Slot({
            date: req.body.date,
            quantity: req.body.quantity
        })
        await slot.save()
    }else{
        slots.quantity = slots.quantity + parseInt(req.body.quantity);
       await slots.save();
        // slots.updateOne({}, { $inc: {quantity: 2 }})
    }

    res.redirect(302, '/slots')
}

// exports.updateSlot = async(req,res) => {
//     const slots = await Slot.find({})
//     console.log(slots)
// } 