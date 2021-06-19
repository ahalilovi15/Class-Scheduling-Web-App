const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const grupa = sequelize.define('grupa', {
        naziv: {
            type: Sequelize.STRING
        }
    });
    return grupa;
}