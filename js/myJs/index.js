$(document).ready(function() {
    completi = 0;
    incompleti = 0;
});


$("#list").click(function() {
    completati();
    nonCompletati();

});

function aggiornaTabelle() {
    setTimeout(function() {}, 1000);
}

function completati() {
    $.ajax({
        url: " http://212.237.32.76:3002/status",
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function(data, status, xhr) {
            svuotaTabella(completi, "tabella2");
            completi = data;
            console.log(completi.length);
            mostraLista(completi, "tabella2");
        },
        error: function() {
            console.log("errore");
        }
    });
}

function nonCompletati() {
    $.ajax({
        url: " http://212.237.32.76:3002/list",
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function(data, status, xhr) {
            svuotaTabella(incompleti, "tabella1");
            incompleti = data;
            console.log(incompleti.length);
            mostraLista(incompleti, "tabella1");
        },
        error: function() {
            console.log("errore");
        }
    });
}


function mostraLista(list, idTabella) {
    for (var i = 0; i < list.length; i++) {
        var tabella = document.getElementById(idTabella);
        var row = tabella.insertRow();
        var cell1 = row.insertCell();
        var cell2 = row.insertCell();
        var cell3 = row.insertCell();
        console.log(list[i]);
        console.log(list[i]["_id"]);
        cell1.innerHTML = list[i]["_id"];
        cell2.innerHTML = list[i].merce;

        if (idTabella == "tabella1") {
            cell3.innerHTML = "<button class=\"my-btn\" onclick=\"cambiaStato('" + list[i]["_id"] + "')\"><b>RIDE</b></button> ";
        } else {
            if (list[i].status == "CONSEGNATO") {
                cell3.innerHTML = "<b>" + "OK" + "</b>";
            } else {
                cell3.innerHTML = "<b>" + "Riding" + "</b>";
            }
        }
    }
}


function cambiaStato(id) {
    console.log("cambio stato: " + id);
    $.ajax({
        url: "http://212.237.32.76:3002/start/" + id,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function(data, status, xhr) {
            console.log("result modifica: " + data);
        },
        error: function() {
            console.log("errore");
        }
    });
}




function svuotaTabella(list, idTabella) {
    console.log("svuoto " + idTabella + ": " + list.length);
    var tabella = document.getElementById(idTabella);
    for (var i = 0; i < list.length; i++) {
        tabella.deleteRow(-1);
    }
}