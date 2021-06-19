const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const path = require('path');
const Sequelize = require('sequelize');
const db = require("./public/db.js");
const { EWOULDBLOCK } = require('constants');
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(bodyParser.urlencoded({ extended: true }));
db.sequelize.sync({ force: true });
app.get('/raspored.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'raspored.html'));
});
app.get('/podaciStudent.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'podaciStudent.html'));
});
app.get('/planiranjeNastavnik.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'planiranjeNastavnik.html'));
});
app.get('/aktivnost.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'aktivnost.html'));
});
app.get('/unosRasporeda.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'unosRasporeda.html'));
});
app.get('/unosStudenata.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'unosStudenata.html'));
});
//GET /predmeti - vraća niz JSON objekata predmeta {naziv:string}
app.get('/v1/predmeti', (req, res) => {
    fs.readFile('predmeti.txt', function(error, contents) {
        if (error) throw error;
        var predmeti = contents.toString().split("\n");
        var niz = [];
        for (var i = 0; i < predmeti.length; i++) {
            var predmet = predmeti[i].split(",");
            if (predmet[0] != '') {
                var objekat = { naziv: predmet[0] };
                niz.push(objekat);
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(niz));
    });
});
//GET /aktivnosti - vraća niz JSON objekata aktivnosti {naziv:string,tip:string,pocetak:number,kraj:number,dan:string}
app.get('/v1/aktivnosti', (req, res) => {
    fs.readFile('aktivnosti.txt', function(error, contents) {
        if (error) throw error;
        var aktivnosti = contents.toString().split("\n");
        var niz = [];
        for (var i = 0; i < aktivnosti.length; i++) {
            var aktivnost = aktivnosti[i].split(",");
            if (aktivnost[0] != '') {
                var objekat = { naziv: aktivnost[0], tip: aktivnost[1], pocetak: aktivnost[2], kraj: aktivnost[3], dan: aktivnost[4] };
                niz.push(objekat);
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(niz));
    });
});
//GET /predmet/:naziv/aktivnost/ - vraća niz objekata aktivnosti za zadani predmet
app.get('/v1/predmet/:naziv/aktivnost/', (req, res) => {

    let searchParametar = req.params.naziv;
    // searchParametar = searchParametar.substring(1);
    fs.readFile('aktivnosti.txt', function(error, contents) {
        if (error) throw error;
        var aktivnosti = contents.toString().split("\n");
        var niz = [];
        for (var i = 0; i < aktivnosti.length; i++) {
            var aktivnost = aktivnosti[i].split(",");
            var objekat = { naziv: aktivnost[0], tip: aktivnost[1], pocetak: aktivnost[2], kraj: aktivnost[3], dan: aktivnost[4] };

            if (objekat.naziv.includes(searchParametar)) niz.push(objekat);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(niz));
    });

});
//POST /predmet - dodaje predmet u datoteku predmeti.txt, u svakom redu
// je jedan naziv predmeta, ako naziv već postoji vraća poruku 
//{message:”Naziv predmeta postoji!”}, a ako je uspješno dodan predmet 
//{message:”Uspješno dodan predmet!”}.
// Podaci se u zahtjevu šalju u JSON formatu
app.post('/v1/predmet', function(req, res) {
    let novaLinija = "";
    let postojiVec = false;
    fs.readFile('predmeti.txt', function(error, contents) {
        if (error) throw error;
        if (!contents.toString()) novaLinija = req.body.naziv;
        else novaLinija = "\n" + req.body.naziv;
        var predmeti = contents.toString().split("\n");
        for (var i = 0; i < predmeti.length; i++) {
            var predmet = predmeti[i].split(",");
            if (predmet[0] == req.body.naziv)
                postojiVec = true;
        }
        if (!postojiVec) {
            fs.appendFile('predmeti.txt', novaLinija, function(err) {
                if (err) throw err;
                res.json({ message: "Uspješno dodan predmet!" });
            });
        } else {
            res.json({ message: "Naziv predmeta postoji!" });
        }
    });

});
//POST /aktivnost - dodaje aktivnost u datoteku aktivnosti.txt, u svakom redu 
//je jedna aktivnost, vrijednosti su odvojene zarezom naziv,tip,pocetak,kraj,dan. 
//Ako postoji greška pri validaciji aktivnosti vraća poruku 
//{message: “Aktivnost nije validna!”}, a ako je aktivnost uspješno dodana 
//{message:”Uspješno dodana aktivnost!”}. Validacija aktivnosti na serverskoj strani 
//je ista kao što je bila na klijentskoj. Podaci se u zahtjevu šalju u JSON formatu
app.post('/v1/aktivnost', function(req, res) {
    var prazan = true;
    // let tijelo = req.body;
    var podudaranje = false;
    if (parseFloat(req.body.pocetak) % 1 != 0.5 && parseFloat(req.body.pocetak) % 1 != 0.0 ||
        parseFloat(req.body.kraj) % 1 != 0.5 && parseFloat(req.body.kraj) % 1 != 0.0 ||
        parseFloat(req.body.pocetak) < 8 || parseFloat(req.body.kraj) > 20 ||
        parseFloat(req.body.kraj) <= parseFloat(req.body.pocetak)) {
        res.json({ message: "Aktivnost nije validna!" });
    } else {
        fs.readFile('aktivnosti.txt', function(error, contents) {
            if (error) throw error;
            if (contents.toString()) prazan = false;
            var aktivnosti = contents.toString().split("\n");
            for (var i = 0; i < aktivnosti.length; i++) {
                var aktivnost = aktivnosti[i].split(",");
                if (aktivnost[4] == req.body.dan) {
                    if (parseFloat(req.body.pocetak) >= aktivnost[2] && parseFloat(req.body.pocetak) < aktivnost[3] ||
                        parseFloat(req.body.kraj) > aktivnost[2] && parseFloat(req.body.kraj) <= aktivnost[3] ||
                        parseFloat(req.body.pocetak) < aktivnost[2] && parseFloat(req.body.kraj) > aktivnost[3])
                        podudaranje = true;
                }
            }
            if (!podudaranje) {
                let novaLinija = "";
                if (!prazan) {
                    novaLinija = "\n" + req.body.naziv + "," + req.body.tip +
                        "," + req.body.pocetak + "," + req.body.kraj + "," + req.body.dan;
                } else {
                    novaLinija = req.body.naziv + "," + req.body.tip +
                        "," + req.body.pocetak + "," + req.body.kraj + "," + req.body.dan;
                }

                fs.appendFile('aktivnosti.txt', novaLinija, function(err) {
                    if (err) throw err;

                    res.json({ message: "Uspješno dodana aktivnost!" });
                });
            } else {
                res.json({ message: "Aktivnost nije validna!" });
            }
        });

    }
});
//DELETE /aktivnost/:naziv - briše aktivnost sa nazivom. Poruke su 
//{message:”Uspješno obrisana aktivnost!”} ili 
//{message:”Greška - aktivnost nije obrisana!”}. Ako ima više aktivnosti
//sa istim nazivom sve se brišu
app.delete('/v1/aktivnost/:naziv/', (req, res) => {

    var pronadjenaAktivnost = false;
    let searchParametar = req.naziv;
    // searchParametar = searchParametar.substring(1);
    fs.readFile('aktivnosti.txt', function(error, contents) {
        if (error) {
            res.json({ message: "Greška - aktivnost nije obrisana!" });
            throw error;
        }
        var aktivnosti = contents.toString().split("\n");
        var aktivnostiNew = "";
        var obrisanZadnji = false;
        for (var i = 0; i < aktivnosti.length; i++) {
            var aktivnost = aktivnosti[i].split(",");
            var objekat = { naziv: aktivnost[0], tip: aktivnost[1], pocetak: aktivnost[2], kraj: aktivnost[3], dan: aktivnost[4] };

            if (!(objekat.naziv == searchParametar)) {
                aktivnostiNew = aktivnostiNew + aktivnost + '\n';
            } else {
                if (i == aktivnosti.length - 1) obrisanZadnji = true;
                pronadjenaAktivnost = true;
            }
        }
        if (pronadjenaAktivnost) aktivnostiNew = aktivnostiNew.slice(0, -1);
        fs.writeFile('aktivnosti.txt', aktivnostiNew, function(error) {
            if (error) {
                res.json({ message: "Greška - aktivnost nije obrisana!" });
                throw error;
            }
        });
        // res.writeHead(200, { 'Content-Type': 'application/json' });
        if (pronadjenaAktivnost)
            res.json({ message: "Uspješno obrisana aktivnost!" });
        else
            res.json({ message: "Greška - aktivnost nije obrisana!" });
    });
});
//DELETE /predmet/:naziv - briše predmet sa nazivom. Poruke su  
//{message:”Uspješno obrisan predmet!”} ili 
//{message:”Greška - predmet nije obrisan!”}
app.delete('/v1/predmet/:naziv/', (req, res) => {
    var pronadjenPredmet = false;
    let searchParametar = req.params.naziv;
    // searchParametar = searchParametar.substring(1);
    fs.readFile('predmeti.txt', function(error, contents) {
        if (error) {
            res.json({ message: "Greška - predmet nije obrisan!" });
            throw error;
        }
        var predmeti = contents.toString().split("\n");
        var predmetiNew = "";

        var obrisanZadnji = false;
        for (var i = 0; i < predmeti.length; i++) {
            var predmet = predmeti[i].split(",");
            var objekat = { naziv: predmet[0] };
            if (objekat.naziv != searchParametar) {
                predmetiNew = predmetiNew + objekat.naziv + '\n';

            } else {
                if (i == predmeti.length - 1) obrisanZadnji = true;
                pronadjenPredmet = true;
            }

        }
        if (pronadjenPredmet) predmetiNew = predmetiNew.slice(0, -1);
        fs.writeFile('predmeti.txt', predmetiNew, function(error) {
            if (error) {
                res.json({ message: "Greška - predmet nije obrisan!" });
                throw error;
            }
        });
        // res.writeHead(200, { 'Content-Type': 'application/json' });
        if (pronadjenPredmet)
            res.json({ message: "Uspješno obrisan predmet!" });
        else
            res.json({ message: "Greška - predmet nije obrisan!" });
    });

});
//DELETE /all - briše sadržaje datoteka predmeti.txt i aktivnosti.txt. 
//Poruke su  {message:”Uspješno obrisan sadržaj datoteka!”} ili 
//{message:”Greška - sadržaj datoteka nije moguće obrisati!”}
app.delete('/v1/all/', (req, res) => {
    fs.writeFile('predmeti.txt', "", function(error) {
        if (error) {
            res.json({ message: "Greška - sadržaj datoteka nije moguće obrisati!" });
            throw error;
        }
    });
    fs.writeFile('aktivnosti.txt', "", function(error) {
        if (error) {
            res.json({ message: "Greška - sadržaj datoteka nije moguće obrisati!" });
            throw error;
        }
    });

    // res.writeHead(200, { 'Content-Type': 'application/json' });
    res.json({ message: "Uspješno obrisan sadržaj datoteka!" });
});
app.get("/v2/predmet", function(req, res) {

    db.predmet.findAll().then(function(podaci) {
        let data = [];

        for (let i = 0; i < podaci.length; i++) {
            let objekat = {
                id: podaci[i].id,
                naziv: podaci[i].naziv
            };
            data.push(objekat);
        }
        res.json(data);
    });
});
app.get("/v2/grupa", function(req, res) {

    db.grupa.findAll().then(function(podaci) {
        let data = [];

        for (let i = 0; i < podaci.length; i++) {
            let objekat = {
                id: podaci[i].id,
                naziv: podaci[i].naziv
            };
            data.push(objekat);
        }
        res.json(data);
    });
});
app.get("/v2/aktivnost", function(req, res) {

    db.aktivnost.findAll().then(function(podaci) {
        let data = [];

        for (let i = 0; i < podaci.length; i++) {
            let objekat = {
                id: podaci[i].id,
                naziv: podaci[i].naziv,
                pocetak: podaci[i].pocetak,
                kraj: podaci[i].kraj
            };
            data.push(objekat);
        }
        res.json(data);
    });
});
app.get("/v2/dan", function(req, res) {

    db.dan.findAll().then(function(podaci) {
        let data = [];

        for (let i = 0; i < podaci.length; i++) {
            let objekat = {
                id: podaci[i].id,
                naziv: podaci[i].naziv
            };
            data.push(objekat);
        }
        res.json(data);
    });
});
app.get("/v2/tip", function(req, res) {

    db.tip.findAll().then(function(podaci) {
        let data = [];

        for (let i = 0; i < podaci.length; i++) {
            let objekat = {
                id: podaci[i].id,
                naziv: podaci[i].naziv
            };
            data.push(objekat);
        }
        res.json(data);
    });
});
app.get("/v2/student", function(req, res) {

    db.student.findAll().then(function(podaci) {
        let data = [];

        for (let i = 0; i < podaci.length; i++) {
            let objekat = {
                id: podaci[i].id,
                ime: podaci[i].ime,
                index: podaci[i].index
            };
            data.push(objekat);
        }
        res.json(data);
    });
});
app.post("/v2/predmet", function(req, res) {
    db.predmet.findOne({ where: { naziv: req.body.naziv } })
        .then(function(podaci) {
            if (!podaci) {
                let id = 0;
                db.predmet.create({
                    naziv: req.body.naziv
                }).then(record => {
                    id = record.id;
                    res.json({ message: "Uspješno dodan predmet!" });
                });
            } else {
                res.json({ message: "Već postoji predmet s tim nazivom!" });
            }
        });

});
app.post("/v2/grupa", function(req, res) {
    db.grupa.findOne({ where: { naziv: req.body.naziv, predmetId: req.body.predmetId } })
        .then(function(podaci) {
            if (!podaci) {
                let id = 0;
                db.grupa.create({
                    naziv: req.body.naziv,
                    predmetId: req.body.predmetId
                }).then(record => {
                    id = record.id;
                    res.json({ message: "Uspješno dodana grupa!" });
                });
            } else {
                res.json({ message: "Već postoji grupa s tim nazivom i predmetom!" });
            }
        });
});
app.post("/v2/aktivnost", async function(req, res) {
    if (parseFloat(req.body.pocetak) % 1 != 0.5 && parseFloat(req.body.pocetak) % 1 != 0.0 ||
        parseFloat(req.body.kraj) % 1 != 0.5 && parseFloat(req.body.kraj) % 1 != 0.0 ||
        parseFloat(req.body.pocetak) < 8 || parseFloat(req.body.kraj) > 20 ||
        parseFloat(req.body.kraj) <= parseFloat(req.body.pocetak)) {
        res.json({ message: "Aktivnost nije validna!" });
        return;
    }

    await db.aktivnost.findAll().then((aktivnosti) => {
        for (var i = 0; i < aktivnosti.length; i++) {
            if (Number.parseInt(req.body.danId) == aktivnosti[i].danId) {
                if (parseFloat(req.body.pocetak) >= aktivnosti[i].pocetak && parseFloat(req.body.pocetak) < aktivnosti[i].kraj ||
                    parseFloat(req.body.kraj) > aktivnosti[i].pocetak && parseFloat(req.body.kraj) <= aktivnosti[i].kraj ||
                    parseFloat(req.body.pocetak) < aktivnosti[i].pocetak && parseFloat(req.body.kraj) > aktivnosti[i].kraj) {
                    res.json({ message: "Aktivnost nije validna!" });

                    return;
                }
            }
        }
    });
    db.aktivnost.findOne({ where: { naziv: req.body.naziv, tipId: req.body.tipId, grupaId: req.body.grupaId } })
        .then(function(podaci) {
            if (!podaci) {
                let id = 0;
                db.aktivnost.create({
                    naziv: req.body.naziv,
                    pocetak: req.body.pocetak,
                    kraj: req.body.kraj,
                    predmetId: req.body.predmetId,
                    grupaId: req.body.grupaId,
                    danId: req.body.danId,
                    tipId: req.body.tipId
                }).then(record => {
                    id = record.id;
                    res.json({ message: "Uspješno dodana aktivnost!" });
                });
            } else {
                res.json({ message: "Već postoji aktivnost!" });
            }
        });
});
app.post("/v2/dan", function(req, res) {
    db.dan.findOne({ where: { naziv: req.body.naziv } })
        .then(function(podaci) {
            if (!podaci) {
                let id = 0;
                db.dan.create({
                    naziv: req.body.naziv
                }).then(record => {
                    id = record.id;
                    res.json({ message: "Uspješno dodan dan!" });
                });
            } else {
                res.json({ message: "Već postoji dan s tim nazivom!" });
            }
        });

});
app.post("/v2/tip", function(req, res) {
    db.tip.findOne({ where: { naziv: req.body.naziv } })
        .then(function(podaci) {
            if (!podaci) {
                let id = 0;
                db.tip.create({
                    naziv: req.body.naziv
                }).then(record => {
                    id = record.id;
                    res.json({ message: "Uspješno dodan tip!" });
                });
            } else {
                res.json({ message: "Već postoji tip s tim nazivom!" });
            }
        });
});
app.post("/v2/student", function(req, res) {
    db.student.findOne({ where: { ime: req.body.ime } })
        .then(function(podaci) {
            if (!podaci) {
                let id = 0;
                db.student.create({
                    ime: req.body.ime,
                    index: req.body.index
                }).then(record => {
                    id = record.id;
                    res.json({ message: "Uspješno dodan student!" });
                });
            } else {
                res.json({ message: "Već postoji student s tim imenom!" });
            }
        });
});
app.delete("/v2/predmet/:id", function(req, res) {
    db.predmet.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji predmet!" });
            }

        });
    db.predmet.destroy({
        where: {
            id: req.params.id
        }
    });
    res.json({ message: "Uspješno obrisan predmet!" });
});
app.delete("/v2/grupa/:id", function(req, res) {
    db.grupa.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji grupa!" });
            }
            db.grupa.destroy({
                where: {
                    id: req.params.id
                }
            });
            res.json({ message: "Uspješno obrisana grupa!" });
        });

});
app.delete("/v2/aktivnost/:id", function(req, res) {
    db.aktivnost.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji aktivnost!" });
            }
            db.aktivnost.destroy({
                where: {
                    id: req.params.id
                }
            });
            res.json({ message: "Uspješno obrisana aktivnost!" });
        });

});
app.delete("/v2/dan/:id", function(req, res) {
    db.dan.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji dan!" });
            }
            db.dan.destroy({
                where: {
                    id: req.params.id
                }
            });
            res.json({ message: "Uspješno obrisan dan!" });
        });

});
app.delete("/v2/tip/:id", function(req, res) {
    db.tip.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji tip!" });
            }
            db.tip.destroy({
                where: {
                    id: req.params.id
                }
            });
            res.json({ message: "Uspješno obrisan tip!" });
        });

});
app.delete("/v2/student/:id", function(req, res) {
    db.student.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji student!" });
            }
            db.student.destroy({
                where: {
                    id: req.params.id
                }
            });
            res.json({ message: "Uspješno obrisan student!" });
        });

});
app.put("/v2/predmet/:id", function(req, res) {
    db.predmet.findOne({ where: { id: req.params.id } })
        .then(record => {
            if (!record) {
                res.json({ message: "Ne postoji predmet!" });
            }
            let values = {
                naziv: req.body.naziv
            }
            record.update(values).then(updatedRecord => {
                res.json({ message: "Uspješno ažuriran predmet!" });
            })
        })
        .catch((error) => {
            res.json({ message: "Greška!" });
        });
});
app.put("/v2/grupa/:id", function(req, res) {
    db.grupa.findOne({ where: { id: req.params.id } })
        .then(record => {
            if (!record) {
                res.json({ message: "Ne postoji grupa!" });
            }
            let values = {
                naziv: req.body.naziv,
                predmetId: req.body.predmetId
            }
            record.update(values).then(updatedRecord => {
                res.json({ message: "Uspješno ažurirana grupa!" });
            })
        })
        .catch((error) => {
            res.json({ message: "Greška!" });
        });
});
app.put("/v2/aktivnost/:id", async function(req, res) {
    if (parseFloat(req.body.pocetak) % 1 != 0.5 && parseFloat(req.body.pocetak) % 1 != 0.0 ||
        parseFloat(req.body.kraj) % 1 != 0.5 && parseFloat(req.body.kraj) % 1 != 0.0 ||
        parseFloat(req.body.pocetak) < 8 || parseFloat(req.body.kraj) > 20 ||
        parseFloat(req.body.kraj) <= parseFloat(req.body.pocetak)) {
        res.json({ message: "Aktivnost nije validna!" });
        return;
    }

    await db.aktivnost.findAll().then((aktivnosti) => {
        for (var i = 0; i < aktivnosti.length; i++) {
            if (Number.parseInt(req.body.danId) == aktivnosti[i].danId) {
                if (parseFloat(req.body.pocetak) >= aktivnosti[i].pocetak && parseFloat(req.body.pocetak) < aktivnosti[i].kraj ||
                    parseFloat(req.body.kraj) > aktivnosti[i].pocetak && parseFloat(req.body.kraj) <= aktivnosti[i].kraj ||
                    parseFloat(req.body.pocetak) < aktivnosti[i].pocetak && parseFloat(req.body.kraj) > aktivnosti[i].kraj) {
                    res.json({ message: "Aktivnost nije validna!" });

                    return;
                }
            }
        }
    });
    db.aktivnost.findOne({ where: { id: req.params.id } })
        .then(record => {
            if (!record) {
                res.json({ message: "Ne postoji aktivnost!" });
            }
            let values = {
                naziv: req.body.naziv,
                pocetak: req.body.pocetak,
                kraj: req.body.kraj,
                predmetId: req.body.predmetId,
                grupaId: req.body.grupaId,
                danId: req.body.danId,
                tipId: req.body.tipId
            }
            record.update(values).then(updatedRecord => {
                res.json({ message: "Uspješno ažurirana aktivnost!" });
            })
        })
        .catch((error) => {
            res.json({ message: "Greška!" });
        });
});
app.put("/v2/dan/:id", function(req, res) {
    db.dan.findOne({ where: { id: req.params.id } })
        .then(record => {
            if (!record) {
                res.json({ message: "Ne postoji dan!" });
            }
            let values = {
                naziv: req.body.naziv
            }
            record.update(values).then(updatedRecord => {
                res.json({ message: "Uspješno ažuriran dan!" });
            })
        })
        .catch((error) => {
            res.json({ message: "Greška!" });
        });
});
app.put("/v2/tip/:id", function(req, res) {
    db.tip.findOne({ where: { id: req.params.id } })
        .then(record => {
            if (!record) {
                res.json({ message: "Ne postoji tip!" });
            }
            let values = {
                naziv: req.body.naziv
            }
            record.update(values).then(updatedRecord => {
                res.json({ message: "Uspješno ažuriran tip!" });
            })
        })
        .catch((error) => {
            res.json({ message: "Greška!" });
        });
});
app.put("/v2/student/:id", function(req, res) {
    db.student.findOne({ where: { id: req.params.id } })
        .then(record => {
            if (!record) {
                res.json({ message: "Ne postoji student!" });
            }
            let values = {
                ime: req.body.ime,
                index: req.body.index
            }
            record.update(values).then(updatedRecord => {
                res.json({ message: "Uspješno ažuriran student!" });
            })
        })
        .catch((error) => {
            res.json({ message: "Greška!" });
        });
});
app.get("/v2/predmet/:id", function(req, res) {
    db.predmet.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji predmet!" });
                return;
            }
            let objekat = {
                id: podaci.id,
                naziv: podaci.naziv
            }
            res.json(objekat);
        });
});
app.get("/v2/grupa/:id", function(req, res) {
    db.grupa.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji grupa!" });
                return;
            }
            let objekat = {
                id: podaci.id,
                naziv: podaci.naziv
            }
            res.json(objekat);
        });
});
app.get("/v2/aktivnost/:id", function(req, res) {
    db.aktivnost.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji aktivnost!" });
                return;
            }
            let objekat = {
                id: podaci.id,
                naziv: podaci.naziv,
                pocetak: podaci[i].pocetak,
                kraj: kraj[i].kraj
            }
            res.json(objekat);
        });
});
app.get("/v2/dan/:id", function(req, res) {
    db.dan.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji dan!" });
                return;
            }
            let objekat = {
                id: podaci.id,
                naziv: podaci.naziv
            }
            res.json(objekat);
        });
});
app.get("/v2/tip/:id", function(req, res) {
    db.tip.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji tip!" });
                return;
            }
            let objekat = {
                id: podaci.id,
                naziv: podaci.naziv
            }
            res.json(objekat);
        });
});
app.get("/v2/student/:id", function(req, res) {
    db.student.findOne({ where: { id: req.params.id } })
        .then(function(podaci) {
            if (!podaci) {
                res.json({ message: "Ne postoji student!" });
                return;
            }
            let objekat = {
                id: podaci.id,
                ime: podaci.ime,
                index: podaci.index
            }
            res.json(objekat);
        });
});
app.post("/aktivnost", async function(req, res) {
    let idDan = 1;
    let idTip = 1;
    let idPredmet = 1;
    let idGrupe = 1;
    //provjeri ima li vec tog dana
    //  let record1 = await db.dan.create({ naziv: req.body.danId });
    //  let record2 = await db.tip.create({ naziv: req.body.tipId });
    // let record3 = await db.predmet.create({ naziv: req.body.predmetId });
    //idDan = record1.id;
    //idTip = record2.id;
    //idPredmet = record3.id;
    if (parseFloat(req.body.pocetak) % 1 != 0.5 && parseFloat(req.body.pocetak) % 1 != 0.0 ||
        parseFloat(req.body.kraj) % 1 != 0.5 && parseFloat(req.body.kraj) % 1 != 0.0 ||
        parseFloat(req.body.pocetak) < 8 || parseFloat(req.body.kraj) > 20 ||
        parseFloat(req.body.kraj) <= parseFloat(req.body.pocetak)) {
        res.json({ message: "Aktivnost nije validna!" });
        return;
    }

    let preklapanje = false;
    db.dan.findOne({ where: { naziv: req.body.danId } })
        .then(function(podaci) {
            if (!podaci) {
                let id = 0;
                db.dan.create({
                    naziv: req.body.danId
                }).then(record1 => {
                    idDan = record1.id;

                });
            } else {
                idDan = podaci.id;
            }
            db.aktivnost.findAll().then((aktivnosti) => {
                for (var i = 0; i < aktivnosti.length; i++) {
                    if (idDan == aktivnosti[i].danId) {
                        if (parseFloat(req.body.pocetak) >= aktivnosti[i].pocetak && parseFloat(req.body.pocetak) < aktivnosti[i].kraj ||
                            parseFloat(req.body.kraj) > aktivnosti[i].pocetak && parseFloat(req.body.kraj) <= aktivnosti[i].kraj ||
                            parseFloat(req.body.pocetak) < aktivnosti[i].pocetak && parseFloat(req.body.kraj) > aktivnosti[i].kraj) {
                            res.json({ message: "Aktivnost nije validna!" });

                            preklapanje = true;
                            return;
                        }
                    }
                }
                if (!preklapanje) {
                    db.tip.findOne({ where: { naziv: req.body.tipId } })
                        .then(function(podaci2) {
                            if (!podaci2) {
                                db.tip.create({
                                    naziv: req.body.tipId
                                }).then(record2 => {
                                    idTip = record2.id;
                                });
                            } else {
                                idTip = podaci2.id;
                            }
                            db.predmet.findOne({ where: { naziv: req.body.predmetId } })
                                .then(function(podaci3) {
                                    if (!podaci3) {
                                        db.predmet.create({
                                            naziv: req.body.predmetId
                                        }).then(record3 => {
                                            idPredmet = record3.id;
                                            db.grupa.findOne({ where: { naziv: req.body.grupaId } })
                                                .then(function(red) {
                                                    idGrupe = red.id;

                                                    db.aktivnost.findOne({ where: { naziv: req.body.naziv, tipId: idTip, grupaId: idGrupe } })
                                                        .then(function(podaci) {
                                                            if (!podaci) {
                                                                let id = 0;
                                                                db.aktivnost.create({
                                                                    naziv: req.body.naziv,
                                                                    pocetak: req.body.pocetak,
                                                                    kraj: req.body.kraj,
                                                                    predmetId: idPredmet,
                                                                    grupaId: idGrupe,
                                                                    danId: idDan,
                                                                    tipId: idTip
                                                                }).then(record => {
                                                                    id = record.id;
                                                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                                                    res.end(JSON.stringify({ message: "dodana aktivnost" }));
                                                                });
                                                            } else {
                                                                res.json({ message: "Već postoji aktivnost!" });
                                                            }
                                                        });
                                                });
                                        });
                                    } else {
                                        idPredmet = podaci3.id;
                                        db.grupa.findOne({ where: { naziv: req.body.grupaId } })
                                            .then(function(red) {
                                                idGrupe = red.id;
                                                db.aktivnost.findOne({ where: { naziv: req.body.naziv, tipId: idTip, grupaId: idGrupe } })
                                                    .then(function(podaci) {
                                                        if (!podaci) {
                                                            let id = 0;
                                                            db.aktivnost.create({
                                                                naziv: req.body.naziv,
                                                                pocetak: req.body.pocetak,
                                                                kraj: req.body.kraj,
                                                                predmetId: idPredmet,
                                                                grupaId: idGrupe,
                                                                danId: idDan,
                                                                tipId: idTip
                                                            }).then(record => {
                                                                id = record.id;
                                                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                                                res.end(JSON.stringify({ message: "dodana aktivnost" }));
                                                            });
                                                        } else {
                                                            res.json({ message: "Već postoji aktivnost!" });
                                                        }
                                                    });
                                            });
                                    }



                                });


                        });
                }
            });



        });



});
app.post("/studentigrupa", function(req, res) {
    let odgovori = [];
    let duzina = req.body.length - 1;
    for (var i = 0; i < req.body.length; i++) {
        let studentovo_ime = req.body[i].ime;
        let studentov_index = req.body[i].index;
        let studentova_grupa = req.body[i].grupa;
        db.student.findOne({ where: { index: req.body[i].index } })
            .then(record => {
                if (!record) {
                    // u ovom slucaju treba create studenta
                    // i create slog u tabeli student_grupa
                    db.student.create({
                        ime: studentovo_ime,
                        index: studentov_index
                    }).then(record => {
                        db.grupa.findOne({ where: { naziv: studentova_grupa } })
                            .then(async function(record2) {
                                await record2.addStudent(record);
                                //  res.json({ message: "Ne postoji student!" });

                            });
                    });
                } else if (record.ime == studentovo_ime) {
                    //ako postoji student sa istim imenom i indexom
                    // samo promijenit id grupe u tabeli student_grupa
                    //moram pronac id stare grupe
                    // studentov id je record.id
                    // pronaci id predmeta od studentova_grupa
                    db.grupa.findOne({ where: { naziv: studentova_grupa } })
                        .then(async function(record2) {
                            let id_predmeta = record2.predmetId;
                            let id_grupe = record2.id;
                            let id_studenta = record.id;
                            let studentove_grupe = (await record.getGrupas());
                            let postoji_grupa_s_idom_id_predmeta = false;
                            for (var j = 0; j < studentove_grupe.length; j++) {
                                if (studentove_grupe[j].predmetId == id_predmeta) {
                                    postoji_grupa_s_idom_id_predmeta = true;
                                    await record.removeGrupa(studentove_grupe[j]);
                                }
                            }
                            await record.addGrupa(record2);
                        });
                    //res.json({ message: "Uspješno ažuriran student!" });

                } else {
                    //vec postoji student s tim indeksom
                    // res.json({ message: "Već postoji student s tim indeksom!" });
                    let poruka = { message: "Student " + " nije kreiran jer postoji student " + " sa istim indexom " };
                    odgovori.push(poruka);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(odgovori));

            });
    }




});
app.listen(3000);
module.exports = app