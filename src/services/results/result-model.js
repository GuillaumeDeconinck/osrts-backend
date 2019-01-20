/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


// result-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');

const { Schema } = mongoose;

const resultSchema = new Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  tag: { type: Schema.Types.Mixed, required: true },
  team_name: { type: String },
  date: { type: String, required: true },
  start_time: { type: String, required: true },
  times: Schema.Types.Mixed,
  checkpoints_ids: [Number],
  number: { type: Number },
});

const resultModel = mongoose.model('results', resultSchema);

module.exports = resultModel;
