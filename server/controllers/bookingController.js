require('../models/mongooseConnection')
const Slot = require('../models/Slot')
const Booking = require('../models/Booking')
const FailedBooking = require('../models/FailedBooking')
const User = require('../models/User')
const bcrypt = require('bcrypt');
const Util = require('./authorization');

//checking if a user exists , if not save and return the user
const getUser = async(phone_number) => {
    //retrieving user based on phone number
     let user = await User.findOne({phone: phone_number})
     if(!user){

        let newUser = new User ({
            name:"",
            phone: phone_number,
            password: ""
        })
        user = await newUser.save();
    }
     return user;
}
//booking
exports.booking = async(req,res) => {
    const authorizedRoles = ["admin", "user"]
    return Util.authorization(req,res,authorizedRoles);
    const bookings = await Booking.find({}).populate("user").populate("slot")
    const users = await  User.find({})
    res.render('bookings/index', {title: "Home", activeNav: "booking", bookings, users})
}
exports.add = async(req,res) => {
    const authorizedRoles = ["admin","user"]
    Util.authorization(req,res,authorizedRoles);
    const slot = await Slot.findById(req.params.slot_id)
    res.render('bookings/add', {title: "Add-Booking",activeNav: "booking", slot, csrfToken: req.csrfToken()})
}
exports.save = async(req,res) => {
    let phone_number = req.body.phone;
    const user = await getUser(phone_number);
    const slot = await Slot.findById(req.params.slot_id);

//     //check if the available slot is greater than zero
    if (slot.quantity > 0) {
        const booking = new Booking({
            user: user._id,
            slot: slot._id,
            service: req.body.service
        })
    
        await booking.save();
        console.log(booking);
        
        //reduce number of slots after saving a successful booking
        slot.quantity -= 1;
        await slot.save()
        if (!user.name){
           return res.render('users/edit', {user,activeNav: "booking", feedback: "Hello, let us know your name.", csrfToken: req.csrfToken()})
        }else {
           return res.render('users/index', {activeNav: "booking",feedback: "Thank You" + " " + user.name + "for booking our service", booking})
        }
       
        // res.render('bookings/add', {slot, success: "Your booking was successful"})
    }else {
        //save client's details to failed booking collection
        const failedBooking = new FailedBooking({
            user: user._id,
            booking_date: slot.date,
            service: req.body.service
        })
        await failedBooking.save()
        res.render('bookings/add', {title: "Booking", activeNav: "booking", slot, error: "Your booking failed"})
    }
 }

exports.updateUser = async(req,res) => {
    let phone_number = req.body.phone_number;
    const user = await User.findOne({phone: phone_number});  
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.name = req.body.name;
    user.password = hashedPassword;
    await user.save();

    res.redirect(302, '/booking')
}

