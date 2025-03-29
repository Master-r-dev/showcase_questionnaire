import Joi from "joi";
import asyncHandler from "express-async-handler";
//TODO

//user validated by validateTelergamData

const userValidation = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string()
      .regex(/^[a-zA-Z0-35-9 _!@#%&*=]{5,40}$/)
      .required(),
    email: Joi.string()
      .regex(
        /^[^\W_]+\w*(?:[.-]\w*)*[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})$/
      )
      .required(),
  });
  await schema.validateAsync(req.body);

  next();
});

const userUpdateValidation = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string()
      .regex(/^[a-zA-Z0-35-9 _!@#%&*=]{5,40}$/)
      .required(),
    email: Joi.string()
      .regex(
        /^[^\W_]+\w*(?:[.-]\w*)*[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})$/
      )
      .required(),
  });
  await schema.validateAsync(req.body);

  next();
});

const idValidation = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  });
  await schema.validateAsync(req.params);

  next();
});

const queryValidation = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    size: Joi.number().integer().min(1).default(1),
  });
  await schema.validateAsync(req.query);
  next();
});

const answerValidation = asyncHandler(async (req, res, next) => {
  const paramsSchema = Joi.object({
    quizId: req.cookies.jwt
      ? Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required()
      : Joi.string().min(1).max(100).required(),
    stepId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  });
  const answerSchema = Joi.object({
    answer: Joi.alternatives().conditional("mode", {
      switch: [
        {
          is: "input",
          then: Joi.string().min(1).max(500).required(),
        },
        {
          is: "multi-choice",
          then: Joi.array()
            .items(Joi.string().min(1).max(500))
            .min(1)
            .required(),
        },
        {
          is: "single-choice",
          then: Joi.string().min(1).max(500).required(),
        },
        {
          is: "numeric",
          then: Joi.number().required(),
        },
      ],
    }),
    mode: Joi.string()
      .valid("input", "multi-choice", "single-choice", "numeric")
      .required(),
  });

  await answerSchema.validateAsync(req.body);
  await paramsSchema.validateAsync(req.params);
  next();
});

const createQuizValidation = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    steps: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required(),
  });
  await schema.validateAsync(req.body);

  next();
});
const editQuizValidation = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    steps: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required(),
  });
  await schema.validateAsync(req.body);

  next();
});

export {
  userValidation,
  userUpdateValidation,
  createQuizValidation,
  editQuizValidation,
  answerValidation,
  idValidation,
};
