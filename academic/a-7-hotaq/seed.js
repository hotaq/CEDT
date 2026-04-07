const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const User = require("./model/User");
const Hospital = require("./model/Hostpital");
const Appointment = require("./model/Appointment");

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Check and create admin user
        let admin = await User.findOne({ email: "admin@gmail.com" });
        if (!admin) {
            admin = await User.create({
                name: "Admin",
                email: "admin@gmail.com",
                password: "12345678",
                role: "admin",
            });
            console.log("Admin user created: admin@gmail.com / 12345678");
        } else {
            console.log("Admin user already exists, skipping...");
        }

        // Check and create regular user
        let user8 = await User.findOne({ email: "user8@gmail.com" });
        if (!user8) {
            user8 = await User.create({
                name: "User8",
                email: "user8@gmail.com",
                password: "12345678",
                role: "user",
            });
            console.log("Regular user created: user8@gmail.com / 12345678");
        } else {
            console.log("Regular user already exists, skipping...");
        }

        // Find the hospital "เทพธารินทร์" and create an appointment for it
        const hospital = await Hospital.findOne({ name: "เทพธารินทร์" });
        if (!hospital) {
            console.log("Hospital 'เทพธารินทร์' not found in database. Skipping appointment creation.");
        } else {
            console.log(`Found hospital: ${hospital.name} (${hospital._id})`);

            // Check if admin already has an appointment at this hospital
            const existingAppt = await Appointment.findOne({
                user: admin._id,
                hospital: hospital._id,
            });

            if (!existingAppt) {
                const appointment = await Appointment.create({
                    apptDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                    user: admin._id,
                    hospital: hospital._id,
                });
                console.log(`Appointment created: ${appointment._id} at ${hospital.name}`);
            } else {
                console.log("Appointment already exists, skipping...");
            }
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seedData();
