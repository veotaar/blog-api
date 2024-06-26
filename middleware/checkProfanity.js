const checkProfanity = async (req, res, next) => {
  const profanity = await fetch('https://vector.profanity.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `${req.body.author} ${req.body.content}` })
  });

  const profanityResponse = await profanity.json();

  if (profanityResponse.isProfanity) {
    return res.status(400).json({
      status: 'fail',
      data: {
        message: 'Profanity detected'
      }
    });
  }

  next();
};

module.exports = checkProfanity;
