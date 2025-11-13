const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require('../../config/db');
const Sslreports = require('../../model/sslReportModel');
const User = require('../../model/userModel');
const nodemailer = require("nodemailer");

// Nodemailer Transporter (using Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS, 
  },
});

const sendWelcomeEmail = async (to, user_name) => {
  const mailOptions = {
    from: `"SSL Security Analysis" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🎉 Welcome to SSL Security Analysis!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h2 style="color:#0056b3;">Welcome to SSL Security Analysis, ${user_name}!</h2>
        <p>
          We're thrilled to have you on board. 
          With <strong>SSL Security Analysis</strong>, you can easily scan and evaluate your website's SSL configuration for improved security and trust.
        </p>
        <p>
          Start by logging in and scanning your first domain — it's quick and easy.
        </p>
        
        <p style="margin-top:20px;">
          Best regards,<br/>
          <strong>The SSL Security Analysis Team</strong>
        </p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(` Welcome email sent to ${to}`);
  } catch (error) {
    console.error(" Error sending welcome email:", error.message);
  }
};


exports.registration = async (req, res) => {
  try {
    const { user_name, email, password } = req.body;

    //NO NEED OF THIS AS WE HAVE IMPLEMENTED JOI VALIDATION
    // if (!user_name || !email || !password) {
    //   return res.status(400).json({ error: "All fields required" });
    // }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      user_name,
      email,
      password: hashedPassword,
      is_first_time: false
    });

    sendWelcomeEmail(newUser.email, newUser.user_name).catch((err)=>
    console.error("email send error",err));


    res.status(201).json({ message: "User registered", newUser });
  } catch (err) {
    console.error("registration error:", err);
    res.status(500).json({ error: err });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

     if (user.is_first_time) {
      return res.status(403).json({
        success: false,
        is_first_time: true,
        userId: user.id,
        email: user.email,
        message: "First-time login detected. Please set your new password."
      });
    }

    if (!user.status) {
      return res.status(403).json({
        error: "Your account is inactive. Please contact your ADMIN.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }


    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        role_id: user.role_id,
      },
      process.env.JWT_SECRETTOKEN,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
        role_id: user.role_id,
        status: user.status,
        phone_number: user.phone_number,
        description: user.description,
        createdAt: user.createdAt
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;

    if (!oldpassword || !newpassword) {
      return res
        .status(400)
        .json("Old password and new password are required!");
    }

    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const match = await bcrypt.compare(oldpassword, user.password);

    if (!match) {
      return res.status(400).json("Incorrect old password!");
    }

    user.password = await bcrypt.hash(newpassword, 10);
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};



//OTP 

// FORGOT PASSWORD (send OTP)
exports.forgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generating our OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration time

    user.otp = otp;
    user.otpExpirationTime = expiry;
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,//my gmail acc
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <p>Hello ${user.user_name},</p>
        <p>Your OTP for resetting password is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
      `,
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Server error while sending OTP" });
  }
};

//  VERIFY OTP

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    if (new Date() > new Date(user.otpExpirationTime))
      return res.status(400).json({ error: "OTP has expired" });

    //canReset status save karyu
    user.canReset = true;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully", canReset: true });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};



// RESET PASSWORD USING OTP

exports.resetForgotPassword = async (req, res) => {
  try {
    const { email, newpassword } = req.body;

    if (!email || !newpassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if OTP was verified recently (canReset flag)
    if (!user.canReset) {
      return res.status(403).json({ error: "OTP verification required before resetting password" });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;

    // Clear temporary fields
    user.otp = null;
    user.otpExpirationTime = null;
    user.canReset = false; // reset flag
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error while resetting password" });
  }
};

exports.firstTimeLoginCheck = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    if (!user.is_first_time) {
      return res.status(400).json({
        success: false,
        message: "This user has already set a password. Please login normally.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "First-time login email verified",
      userId: user.id,
      email: user.email,
    });

  } catch (error) {
    console.error("Error verifying first-time login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.setNewPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, newPassword, confirmPassword } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.email !== email) {
      return res.status(400).json({
        success: false,
        message: "Email does not match the user account",
      });
    }

    if (!user.is_first_time) {
      return res.status(400).json({
        success: false,
        message: "This user has already set a password",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.is_first_time = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password created successfully. Please login now.",
    });

  } catch (error) {
    console.error("Error setting new password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
