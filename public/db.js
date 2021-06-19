const Sequelize = require("sequelize");
const path = require('path');
const sequelize = new Sequelize("wt2018457", "root", "root", { host: 'localhost', dialect: 'mysql' });
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.predmet = require(path.join(__dirname, '/predmet.js'))(sequelize, Sequelize.DataTypes);
db.grupa = require(path.join(__dirname, '/grupa.js'))(sequelize, Sequelize.DataTypes);
db.aktivnost = require(path.join(__dirname, '/aktivnost.js'))(sequelize, Sequelize.DataTypes);
db.dan = require(path.join(__dirname, '/dan.js'))(sequelize, Sequelize.DataTypes);
db.tip = require(path.join(__dirname, '/tip.js'))(sequelize, Sequelize.DataTypes);
db.student = require(path.join(__dirname, '/student.js'))(sequelize, Sequelize.DataTypes);


//Predmet 1-N Grupa
db.predmet.hasMany(db.grupa, { foreignKey: { allowNull: false } });
db.grupa.belongsTo(db.predmet);

//Aktivnost N-1 Predmet
db.predmet.hasMany(db.aktivnost, { foreignKey: { allowNull: false } });
db.aktivnost.belongsTo(db.predmet);

//Aktivnost N-0 Grupa
db.grupa.hasMany(db.aktivnost);
db.aktivnost.belongsTo(db.grupa);

//Aktivnost N-1 Dan
db.dan.hasMany(db.aktivnost, { foreignKey: { allowNull: false } });
db.aktivnost.belongsTo(db.dan);

//Aktivnost N-1 Tip
db.tip.hasMany(db.aktivnost, { foreignKey: { allowNull: false } });
db.aktivnost.belongsTo(db.tip);

//Student N-M Grupa
db.student.belongsToMany(db.grupa, { through: 'student_grupa' });
db.grupa.belongsToMany(db.student, { through: 'student_grupa' });

module.exports = db;