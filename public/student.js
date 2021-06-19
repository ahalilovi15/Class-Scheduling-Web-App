const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const student = sequelize.define('student', {
        ime: {
            type: Sequelize.STRING
        },
        index: {
            type: Sequelize.STRING
        }
    });
    return student;
}