const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ errors });
    }

    next();
  };
};

const schemas = {
  register: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    password: Joi.string().min(8).required(),
    isGuest: Joi.boolean().default(false)
  }).or('email', 'phone'),

  login: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    password: Joi.string().required()
  }).or('email', 'phone'),

  createMessage: Joi.object({
    text: Joi.string().min(1).max(140).required(),
    language: Joi.string().valid('zh', 'en', 'ja', 'ko').default('zh')
  }),

  createReaction: Joi.object({
    reactionType: Joi.string().valid('resonate', 'curious', 'applause', 'want_more').required()
  }),

  createReport: Joi.object({
    reason: Joi.string().min(10).max(500).required()
  })
};

module.exports = {
  validateRequest,
  schemas
};
