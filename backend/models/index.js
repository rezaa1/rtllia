const Agent = require('./Agent');
const LLMConfiguration = require('./LLMConfiguration');
const User = require('./User');
const Organization = require('./Organization');
const Call = require('./Call');

// Set up associations
Agent.hasOne(LLMConfiguration, { foreignKey: 'agentId' });

// Export all models
module.exports = {
  Agent,
  LLMConfiguration,
  User,
  Organization,
  Call
};
