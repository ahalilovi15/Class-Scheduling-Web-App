var kraj;
var pocetak;

function iscrtajRaspored(div, dani, satPocetak, satKraj) {
    var body = div;
    if (satPocetak >= satKraj || !Number.isInteger(satPocetak) || !Number.isInteger(satKraj)) {
        var par = document.createElement('p');
        var greska = document.createTextNode("Greška");
        par.appendChild(greska);
        div.appendChild(par);
        return 0;
    }
    var tbl = document.createElement('table');
    tbl.setAttribute('class', satPocetak);
    tbl.classList.add(satKraj);
    tbl.classList.add("center");
    var tbdy = document.createElement('tbody');
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    var pom = satPocetak;
    for (var j = 0; j < (satKraj - satPocetak) * 2; j++) {
        var th = document.createElement('th');
        if (pom < 13 && pom % 2 == 0) {
            th.appendChild(document.createTextNode(pom + ':00'));
            th.setAttribute('colSpan', '2');
            j++;
        } else if (pom > 14 && pom % 2 == 1) {
            th.appendChild(document.createTextNode(pom + ':00'));
            th.setAttribute('colSpan', '2');
            j++;
        } else {
            th.appendChild(document.createTextNode(''));

            tr.appendChild(th);
            th = document.createElement('th');
            th.appendChild(document.createTextNode(''));
            j++;
        }
        tr.appendChild(th);
        pom = pom + 1;
    }
    thead.appendChild(tr);
    for (var i = 0; i < dani.length; i++) {
        tr = document.createElement('tr');
        for (var j = 0; j < (satKraj - satPocetak) * 2 + 1; j++) {

            var td = document.createElement('td');
            if (j == 0)
                td.appendChild(document.createTextNode(dani[i]));
            else
                td.appendChild(document.createTextNode('\u0020'))
                //  i == 1 && j == 1 ? td.setAttribute('rowSpan', '2') : null;
            tr.appendChild(td)

        }
        tbdy.appendChild(tr);
    }
    tbl.appendChild(thead);
    tbl.appendChild(tbdy);
    body.appendChild(tbl);
    for (var i = 0; i < tbl.rows.length; i++) {
        for (var j = 0; j < tbl.rows[i].cells.length; j++) {
            if (j != 0)
                tbl.rows[i].cells[j].setAttribute("class", "emp");
            if (j % 2 == 0) {
                tbl.rows[i].cells[j].classList.add('izuzetak2');
            } else {
                tbl.rows[i].cells[j].classList.add('izuzetak');
            }
        }

    }
    //  iscrtajLinije(div);
}

function iscrtajLinije(div) {
    var table = div.firstElementChild;
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++) {
            if (j % 2 == 0) {
                table.rows[i].cells[j].setAttribute("class", "izuzetak2");
            } else {
                table.rows[i].cells[j].setAttribute("class", "izuzetak");
            }
        }
    }
}

function dodajAktivnost(raspored, naziv, tip, vrijemePocetak, vrijemeKraj, dan) {

    if (vrijemePocetak < 0 || vrijemePocetak > 24 || vrijemeKraj < 0 || vrijemeKraj > 24 ||
        !(Number.isInteger(vrijemePocetak) || !Number.isInteger(vrijemePocetak) && vrijemePocetak % 1 == 0.5) ||
        !(Number.isInteger(vrijemeKraj) || !Number.isInteger(vrijemeKraj) && vrijemeKraj % 1 == 0.5) || vrijemeKraj <= vrijemePocetak) {
        alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
        return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
    }
    if (raspored == null) {
        alert("Greška - raspored nije kreiran");
        return "Greška - raspored nije kreiran";
    }
    var table = raspored.firstElementChild;
    table = raspored.getElementsByTagName('table')[0];
    if (table == null || table.tagName == 'p') {
        alert("Greška - raspored nije kreiran");
        return "Greška - raspored nije kreiran";
    }
    var imaDan = false;
    for (var a = 0; a < table.rows.length; a++) {
        if (table.rows[a].cells[0].innerHTML == dan)
            imaDan = true;
    }
    if (!imaDan || vrijemePocetak < table.classList[0] || vrijemeKraj > table.classList[1]) {
        alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
        return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
    }
    var r = table.rows.length;
    var poc = table.rows[0].cells[0].innerHTML;
    poc = table.classList[0];
    // poc = parseInt(poc[0]); // od ovog broja pocinje tabela
    if (poc == NaN) {
        poc = table.rows[0].cells[2].innerHTML;

        poc = parseInt(poc[0]);
    }
    console.log(pocetak);
    for (var y = 0; y < r; y++) {
        if (table.rows[y].cells[0].innerHTML == dan) {
            var zbirColSpanova = 0
            for (z = 0; z < table.rows[y].cells.length; z++) {
                if (table.rows[y].cells[z].colSpan != 1) {
                    for (w = 0; w < table.rows[y].cells[z].colSpan; w++) {
                        if ((vrijemePocetak - poc) * 2 + 1 == z + w + zbirColSpanova ||
                            (vrijemeKraj - poc) * 2 == z + w + zbirColSpanova) {
                            alert("Greška - već postoji termin u rasporedu u zadanom vremenu");
                            return "Greška - već postoji termin u rasporedu u zadanom vremenu";
                        }
                    }
                    zbirColSpanova = zbirColSpanova - 1 + table.rows[y].cells[z].colSpan;
                }
            }
        }
    }
    for (var i = 0; i < r; i++) {
        var pom = 0;
        for (var j = 0; j < table.rows[i].cells.length; j++) {
            if (table.rows[i].cells[0].innerHTML == dan && j == 1 + 2 * (vrijemePocetak - poc) - pom) {
                if (table.rows[i].cells[j].colSpan != 1) {
                    alert("Greška - već postoji termin u rasporedu u zadanom vremenu");
                    return "Greška - već postoji termin u rasporedu u zadanom vremenu";
                }
                console.log(table.rows[i].cells[j].classList);
                table.rows[i].cells[j].innerHTML = naziv + "<br>" + tip;
                table.rows[i].cells[j].setAttribute("colSpan", (vrijemeKraj - vrijemePocetak) * 2);
                table.rows[i].cells[j].classList.remove("emp");
                for (var k = j + 1; k < j + (vrijemeKraj - vrijemePocetak) * 2; k++) { table.rows[i].deleteCell(k); }
                if (Number.isInteger(vrijemePocetak)) {
                    table.rows[i].cells[j].classList.add('izuzetak');
                    table.rows[i].cells[j].classList.remove('izuzetak2');
                } else {
                    table.rows[i].cells[j].classList.add('izuzetak2');
                    table.rows[i].cells[j].classList.remove('izuzetak');
                }
                if (Number.isInteger(vrijemeKraj)) {
                    table.rows[i].cells[j + 1].classList.add('izuzetak');
                    table.rows[i].cells[j + 1].classList.remove('izuzetak2');
                    var x = 0;
                    for (var l = j + 2; l < table.rows[i].cells.length; l++) {
                        if (x % 2 == 0) {
                            table.rows[i].cells[l].classList.add('izuzetak2');
                            table.rows[i].cells[l].classList.remove('izuzetak');
                        } else {
                            table.rows[i].cells[l].classList.add('izuzetak');
                            table.rows[i].cells[l].classList.remove('izuzetak2');
                        }
                        x++;
                    }
                } else {
                    table.rows[i].cells[j + 1].classList.add('izuzetak2');
                    table.rows[i].cells[j + 1].classList.remove('izuzetak');
                    var x = 0
                    for (var l = j + 2; l < table.rows[i].cells.length; l++) {
                        if (x % 2 == 0) {
                            table.rows[i].cells[l].classList.add('izuzetak');
                            table.rows[i].cells[l].classList.remove('izuzetak2');
                        } else {
                            table.rows[i].cells[l].classList.add('izuzetak2');
                            table.rows[i].cells[l].classList.remove('izuzetak');
                        }
                        x++;
                    }
                }
            }
            var spans = table.rows[i].cells[j].colSpan;
            if (spans != 1) {
                pom = pom + spans;
                pom = pom - 1;
            }

        }
    }

}