const { Op } = require("sequelize");
const User = require("../../model/userModel");
const Role = require("../../model/rolesModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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



exports.createUser = async (req, res) => {
  try {
    const { user_name, email, password, phone_number, role_id, status } = req.body;

    const existingUser = await User.findOne({ where: { email, cb_deleted:false } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use another one.",

      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/profile_images/${req.file.filename}`;
    }


    const newUser = await User.create({
      user_name,
      email,
      password: hashedPassword,
      phone_number,
      role_id,
      status,
      profile_image: imagePath,
      is_first_time:true
    });


    sendWelcomeEmail(email, user_name)
      .then(() => console.log(`Welcome email sent to ${email}`))
      .catch((err) => console.error("Error sending welcome email:", err.message));


    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user.",
      error: error.message,
    });
  }
};


// our filters + pagination suppport
exports.getAllUsersOLD = async (req, res) => {
  try {
    const { name, email, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (name) whereClause.user_name = { [Op.like]: `%${name}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (status !== undefined && status !== "")
      whereClause.status = status === "true" || status === true;

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Role,
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "user_name", "email", "phone_number", "status", "createdAt"],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      totalRecords: count,
      currentPage: parseInt(page),
      perPage: parseInt(limit),
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users.",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { name, email, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {cb_deleted: false};
    if (name) whereClause.user_name = { [Op.like]: `%${name}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (status !== undefined && status !== "")
      whereClause.status = status === "true" || status === true;

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
    //   {cb_deleted:false},
      include: [{ model: Role, attributes: ["id", "name"] }],
      attributes: ["id", "user_name", "email", "phone_number", "status"],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      totalRecords: count,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users.",
      error: error.message,
    });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{ model: Role, attributes: ["id", "name"] }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user.",
      error: error.message,
    });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, email, phone_number, role_id, status } = req.body;

    // Find existing user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    //  Handle profile image upload (if new image uploaded)
    let imagePath = user.profile_image; // Keep old image by default

    if (req.file) {
      // Delete old image if exists
      if (user.profile_image) {
        const oldImagePath = path.join(__dirname, "../../", user.profile_image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn("Old image not found or already deleted:", err.message);
        });
      }

      // Save new uploaded image path
      imagePath = `/uploads/profile_images/${req.file.filename}`;
    }

    //  Update user record
    await user.update({
      user_name,
      email,
      phone_number,
      role_id,
      status,
      profile_image: imagePath,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user.",
      error: error.message,
    });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.cb_deleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User marked as deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user.",
      error: error.message,
    });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Toggle status (true -> false or false -> true)
    const newStatus = !user.status;
    await user.update({ status: newStatus });

    res.status(200).json({
      success: true,
      message: `User status changed to ${newStatus ? "Active" : "Inactive"}.`,
      data: { id: user.id, status: newStatus },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling user status.",
      error: error.message,
    });
  }
};
