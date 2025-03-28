'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create chat_sessions table
    await queryInterface.createTable('chat_sessions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      agent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'agents',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      visitor_id: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ended_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create chat_messages table
    await queryInterface.createTable('chat_messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      chat_session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_sessions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      sender_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      message_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      voice_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create widget_configurations table
    await queryInterface.createTable('widget_configurations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      agent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'agents',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      theme_color: {
        type: Sequelize.STRING(20),
        defaultValue: '#0088FF'
      },
      header_text: {
        type: Sequelize.STRING(100),
        defaultValue: 'Chat with us'
      },
      welcome_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      allowed_domains: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for performance
    await queryInterface.addIndex('chat_sessions', ['agent_id'], {
      name: 'idx_chat_sessions_agent'
    });
    await queryInterface.addIndex('chat_sessions', ['visitor_id'], {
      name: 'idx_chat_sessions_visitor'
    });
    await queryInterface.addIndex('chat_messages', ['chat_session_id'], {
      name: 'idx_chat_messages_session'
    });
    await queryInterface.addIndex('widget_configurations', ['organization_id'], {
      name: 'idx_widget_configurations_organization'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('chat_messages');
    await queryInterface.dropTable('chat_sessions');
    await queryInterface.dropTable('widget_configurations');
  }
};
