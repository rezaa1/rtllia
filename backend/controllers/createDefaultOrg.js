const Organization = require('./models/Organization');
const sequelize = require('./config/database');

async function createDefaultOrganization() {
  try {
    // Check if the default organization already exists
    const existingOrg = await Organization.findOne({
      where: { slug: 'default-organization' }
    });

    if (existingOrg) {
      console.log('Default organization already exists with ID:', existingOrg.id);
      return existingOrg;
    }

    // Create the default organization
    const defaultOrg = await Organization.create({
      name: 'Default Organization',
      slug: 'default-organization',
      customDomain: null,
      logoUrl: null,
      primaryColor: '#007bff',
      secondaryColor: '#6c757d'
    });

    console.log('Default organization created successfully with ID:', defaultOrg.id);
    return defaultOrg;
  } catch (error) {
    console.error('Error creating default organization:', error);
    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await createDefaultOrganization();
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  })();
}

module.exports = createDefaultOrganization;
