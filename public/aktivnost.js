const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const aktivnost = sequelize.define('aktivnost', {
        naziv: {
            type: Sequelize.STRING
        },
        pocetak: {
            type: Sequelize.FLOAT
        },
        kraj: {
            type: Sequelize.FLOAT
        }
    });
    return aktivnost;
}