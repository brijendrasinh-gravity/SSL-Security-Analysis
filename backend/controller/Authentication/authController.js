const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../../model/userModel');
const Role = require('../../model/rolesModel');
const RolePermission = require('../../model/rolePermissionModel');
const nodemailer = require("nodemailer");
const { getClientIP, fetchIPInfo, isIPBlocked } = require('../../utils/ipChecker');
const GeneralSetting = require('../../model/generalSettingModel');
const Blocked_IP = require('../../model/blockedipModel');
const axios = require('axios');

// In-memory storage for tracking login attempts by IP
const loginAttempts = new Map();

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
    
    // Get client IP
    let clientIP;
    try {
      const ipResponse = await axios.get("https://ipwhois.app/json/", { timeout: 3000 });
      clientIP = ipResponse.data.ip;
    } catch (error) {
      clientIP = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress || "127.0.0.1";
      if (clientIP.startsWith("::ffff:")) clientIP = clientIP.substring(7);
    }
    
    console.log("Login attempt from IP:", clientIP);
    
    // Check if IP is already blocked
    const blocked = await isIPBlocked(clientIP);
    if (blocked) {
      return res.status(403).json({ 
        error: "Access denied. Your IP address has been blocked." 
      });
    }

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
      // Get max login attempts from general_settings table
      const maxAttemptsSetting = await GeneralSetting.findOne({
        where: { field_name: "MAX_LOGIN_ATTEMPTS", cb_deleted: false }
      });
      const maxAttempts = parseInt(maxAttemptsSetting?.field_value || 5);

      const attemptData = loginAttempts.get(clientIP) || { count: 0, lastAttempt: new Date() };
      attemptData.count += 1;
      attemptData.lastAttempt = new Date();
      attemptData.email = email;
      loginAttempts.set(clientIP, attemptData);

      if (attemptData.count >= maxAttempts) {
        const existingBlock = await Blocked_IP.findOne({
          where: { ip_address: clientIP, cb_deleted: false }
        });

        if (!existingBlock) {
          const browser = req.headers['user-agent'] || "Unknown";
          await Blocked_IP.create({
            ip_address: clientIP,
            browser_info: browser,
            blocked_type: "Login",
            login_access: false
          });
        }

        loginAttempts.delete(clientIP);

        return res.status(403).json({
          error: `Maximum login attempts (${maxAttempts}) exceeded. Your IP has been blocked.`,
          blocked: true
        });
      }

      const remainingAttempts = maxAttempts - attemptData.count;
      return res.status(401).json({ 
        error: `Invalid credentials. ${remainingAttempts} attempt(s) remaining.`,
        remainingAttempts
      });
    }

    //Pass Expiry Check
    const expirySetting = await GeneralSetting.findOne({
      where: { field_name: "PASSWORD_EXPIRATION_DAYS", cb_deleted: false }
    });

    if (expirySetting) {
      const expiryDays = parseInt(expirySetting.field_value || 0);

      if (expiryDays > 0) {
        const lastChanged = user.password_changed_at;

        if (!lastChanged) {
          // Never changed – treat as expired
          return res.status(403).json({
            password_expired: true,
            message: "Your password has expired. Please reset your password."
          });
        }

        const diffMs = Date.now() - new Date(lastChanged).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= expiryDays) {
          return res.status(403).json({
            password_expired: true,
            message: "Your password has expired. Please reset your password."
          });
        }
      }
    }

    // Successful login - reset login attempts for this IP
    loginAttempts.delete(clientIP);

    // Check password expiration
    const passwordExpirySetting = await GeneralSetting.findOne({
      where: { field_name: "PASSWORD_EXPIRY_DAYS", cb_deleted: false }
    });
    const expiryDays = parseInt(passwordExpirySetting?.field_value || 90);
    
    let passwordStatus = { expired: false, daysRemaining: null, showReminder: false };
    
    if (user.password_changed_at) {
      const passwordAge = Math.floor((new Date() - new Date(user.password_changed_at)) / (1000 * 60 * 60 * 24));
      const daysRemaining = expiryDays - passwordAge;
      
      if (daysRemaining <= 0) {
        // Password expired - force change
        return res.status(403).json({
          error: "Your password has expired. Please change your password.",
          passwordExpired: true,
          userId: user.id,
          email: user.email
        });
      } else if (daysRemaining <= 7) {
        // Check if reminder should be shown (once per day)
        const today = new Date().toDateString();
        const lastReminder = user.last_password_reminder ? new Date(user.last_password_reminder).toDateString() : null;
        
        if (lastReminder !== today) {
          passwordStatus.showReminder = true;
          passwordStatus.daysRemaining = daysRemaining;
          
          // Update last reminder date
          await user.update({ last_password_reminder: new Date() });
        }
      }
    }

    // Fetch user's role and permissions
    const role = await Role.findByPk(user.role_id);
    const permissions = await RolePermission.findAll({
      where: { role_id: user.role_id, cb_deleted: false },
      attributes: ['module_name', 'canList', 'canCreate', 'canModify', 'canDelete']
    });

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
      passwordStatus,
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
        role_id: user.role_id,
        status: user.status,
        phone_number: user.phone_number,
        description: user.description,
        createdAt: user.createdAt,
        role: {
          id: role?.id,
          name: role?.name,
          is_Admin: role?.is_Admin || false
        },
        permissions: permissions || []
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
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required!"
      });
    }

    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!"
      });
    }

    const match = await bcrypt.compare(oldpassword, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password!"
      });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    await user.update({
      password: hashedPassword,
      password_changed_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
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

    // Update password + timestamp
    await user.update({
      password: hashedPassword,
      password_changed_at: new Date(),    //for expiration feature
      otp: null,
      otpExpirationTime: null,
      canReset: false
    });

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
    user.password_changed_at; new Date();

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
