const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const predmet = sequelize.define('predmet', {
        naziv: {
            type: Sequelize.STRING
        }
    });
    return predmet;
}