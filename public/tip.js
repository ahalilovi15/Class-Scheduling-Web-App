const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const tip = sequelize.define('tip', {
        naziv: {
            type: Sequelize.STRING
        }
    });
    return tip;
}