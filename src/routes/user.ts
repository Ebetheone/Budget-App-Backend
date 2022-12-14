import bcrypt from "bcrypt";
import express from "express";

import { verifyToken } from "../utils/verify";
import { User } from "../models/User";

const router = express.Router();

router.get("/", async (_, res) => {
  res.status(403).send();
});

router.get("/getUsers", verifyToken, async (req, res) => {
  const users = await User.find();
  const formatted = users.map((d) => ({
    _id: d._id,
    email: d.email,
    firstName: d.firstName,
    lastName: d.lastName,
  }));
  res.status(200).send({ result: formatted, success: true });
});

router.get("/user/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userData = await User.find({ _id: id });
  res.status(200).send({ result: userData, success: true });
});

router.post("/edit", async (req, res) => {
  const { id, firstName, lastName, password } = req.body;

  if (!id || !password || !firstName || !lastName) {
    return res
      .status(200)
      .send({ result: "Хэрэглэгч олдсонгүй", success: false });
  }

  const existUser = await User.findById({ _id: id });
  if (!existUser) {
    return res
      .status(200)
      .send({ result: "Хэрэглэгч олдсонгүй", success: false });
  }

  const hashPass = bcrypt.hashSync(password, 12);
  await User.findByIdAndUpdate(
    id,
    Object.assign(existUser, { password: hashPass })
  );
  return res
    .status(200)
    .send({ result: "Амжилттай хадгалагдлаа", success: true });
});

router.post("/delete", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res
      .status(200)
      .send({ success: false, result: "Хэрэглэгчийн userId-г оруулна уу." });
  }
  await User.findByIdAndDelete({ _id: userId });
  res.status(200).send({
    result: userId,
    success: true,
  });
});

module.exports = router;
