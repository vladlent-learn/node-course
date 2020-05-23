const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');

const User = require('../models/user');

//Login
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user: user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Logout
router.post('/users/logout', auth, async (req, res) => {
  const user = req.user;
  try {
    user.tokens = user.tokens.filter(({ token }) => token !== req.token);
    await user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  const user = req.user;
  try {
    user.tokens = [];
    await user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// CRUD
router.post('/users', async (req, res) => {
  try {
    const user = await new User(req.body).save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    // const user = await User.findById(req.params.id);
    const user = req.user;
    updates.forEach(update => (user[update] = req.body[update]));

    await user.save();
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    //
    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
