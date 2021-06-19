const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const dan = sequelize.define('dan', {
        naziv: {
            type: Sequelize.STRING
        }
    });
    return dan;
}