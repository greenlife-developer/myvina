import { Request, Response } from "express-serve-static-core";
const bcrypt = require("bcrypt");
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
import User, { IUser } from "../model/User";
const jwt = require("jsonwebtoken");

const generateToken = (id: IUser["_id"]) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const createUser = async (req: Request, res: Response) => {
  console.log("Received request to create or update user:", req.body);

  try {
    const { id, name, email, password, role, permissions } = req.body;

    if (!name || !role || !permissions) {
      return res
        .status(400)
        .json({ message: "Name, role, and permissions are required." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if (id) {
      // Update existing user
      const existingUser = await User.findById(id);
      if (!existingUser)
        return res.status(404).json({ message: "User not found." });

      existingUser.name = name;
      existingUser.email = email;
      existingUser.role = role;
      existingUser.permissions = permissions;

      if (password) {
        existingUser.password = hash;
      }

      await existingUser.save();
      return res
        .status(200)
        .json({ message: "User updated", user: existingUser });
    } else {
      // Create new user
      const newUser = new User({
        name,
        email,
        password: hash,
        role,
        permissions,
      });

      await newUser.save();
      return res.status(201).json({ message: "User created", user: newUser });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = generateToken(user._id);

    console.log("Generated token for user:", user._id);

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires: new Date(Date.now() + 86400 * 1000), // 1 day
    } as any);

    // Here you would typically generate a JWT token and return it
    res.status(200).json({ message: "Login successful", user, status: 200 });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err });
  }
};

const loginStatus = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  console.log("Received token for login status check:", token);
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Token verification result:", verified);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
};

const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
      secure: true,
    });
    return res.status(200).json({ message: "Successfully Logged Out" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});

    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, permissions } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;

    await user.save();
    return res.status(200).json({ message: "User updated", user });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("Received request to delete user:", id);
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res
      .status(200)
      .json({ message: "User deleted successfully.", status: 200 });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err });
  }
};

module.exports = {
  createUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser,
  loginStatus,
  logoutUser,
};
