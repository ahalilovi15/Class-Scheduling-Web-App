let chai = require('chai');
const fs = require('fs');
let chaiHttp = require('chai-http');
let server = require('../index');
const { response } = require('../index');
chai.should();
chai.use(chaiHttp);
var niz = [];

describe('Testiranje GET, POST i DELETE metoda', function() {
    // this.timeout(15000);
    const contents = fs.readFileSync('testniPodaci.txt', { encoding: 'utf8', flag: 'r' });
    var testovi = contents.toString().split("\n");
    for (var i = 0; i < testovi.length; i++) {
        var test = testovi[i].split(/(?<!\\),/g);
        var test1 = testovi[i].split(",");
        var objekat = { operacija: test[0], ruta: test[1], ulaz: test[2], izlaz: test[3] };
        if (test[0] == 'DELETE') {
            let ruta = test[1];
            let odgovor = test[3].toString().split(":")[1];
            odgovor = odgovor.replace(/[\"\\}]/g, "");
            it(test[0] + ' ' + test[1], function(done) {
                chai.request(server)
                    .delete(ruta)
                    .end((err, res) => {
                        try {
                            res.body.should.have.property("message").that.is.equal(odgovor);
                            done();
                        } catch {
                            done();
                        }
                    });
            });
        } else if (test[0] == 'GET') {
            let odg = test[3];
            let ruta = test[1];
            odg = odg.replace(/[\\]/g, "");
            let odgovor = test[3].replace(/[\[\]]/g, "")
            odgovor = odgovor.toString().split("}");
            it(test[0] + ' ' + test[1], function(done) {
                chai.request(server)
                    .get(ruta)
                    .end((err, res) => {
                        if (err) throw err;
                        try {
                            // console.log(JSON.parse(odg));
                            //console.log(res.body);
                            res.body.should.be.eql(JSON.parse(odg));
                            done();
                        } catch (e) { done(e); }
                    });
            });
        } else if (test[0] == 'POST') {
            // console.log(test)
            let odg = test[3];
            let ruta = test[1]
            let ulaz = test[2];
            ulaz = ulaz.replace(/[\\]/g, "");
            odg = odg.replace(/[\\]/g, "");
            // console.log(ulaz);
            it(test[0] + ' ' + test[1], function(done) {
                chai.request(server)
                    .post(ruta)
                    .send(JSON.parse(ulaz))
                    .end((err, res) => {
                        if (err) throw err;
                        try {
                            // console.log(JSON.parse(odg));
                            // console.log(res.body);
                            res.body.should.be.eql(JSON.parse(odg));
                            done();
                        } catch (e) { done(e); }
                    });
            });
        }
    }


});