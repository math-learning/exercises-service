const ping = (req, res) => {
  res.status(200)
    .send({ status: 'ok' });
};

module.exports = {
  ping,
};
