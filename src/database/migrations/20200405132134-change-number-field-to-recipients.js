module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('recipients', 'number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('recipients', 'number', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
