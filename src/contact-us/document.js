import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

const contactUsSchema = new Schema({
  talkAbout: {
    type: String,
    required: true,
  },
  timeFrame: {
    type: String,
    required: true,
  },
  projectType: {
    type: String,
    required: true,
  },
  budget: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requester: {
    name: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
  },
});

contactUsSchema.statics.validate = (body) => {
  const schema = {
    talkAbout: Joi.string().required(),
    timeFrame: Joi.string().required(),
    projectType: Joi.string().required(),
    budget: Joi.string().required(),
    description: Joi.string().required(),
    requester: Joi.object()
      .keys({
        name: Joi.string().required(),
        companyName: Joi.string(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string(),
      }),
  };
  return Joi.validate(body, schema, {
    convert: true,
    abortEarly: false,
  });
};

export const ContactUs = mongoose.model('ContactUs', contactUsSchema);
