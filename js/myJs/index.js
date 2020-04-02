$(document).ready(function() {
    completi = 0;
    incompleti = 0;
    aggiorna = true;
    stopAggiornamento = false;
    $("#home").hide();
});

$("#list").click(function() {
    $("#list").hide();
    $("#home").show();
    completati();
    nonCompletati();
    stopAggiornamento = false;
    if (aggiorna) {
        aggiornaTabelle();
    }
    aggiorna = false;
});
$("#home").click(function() {
    $("#home").hide();
    $("#list").show();
    console.log("fermo aggiornamenti");
    stopAggiornamento = true;
    aggiorna = true;
    $("#tabellaNonCompletati").empty();
    $("#tabellaCompletati").empty();
});

function aggiornaTabelle() {
    console.log("stop aggiornametno: " + stopAggiornamento);
    setTimeout(function() {
        if (!stopAggiornamento) {
            console.log("aggiorno");
            completati();
            nonCompletati();
            aggiornaTabelle();
        }
    }, 20000);
}

function completati() {
    $.ajax({
        url: " http://212.237.32.76:3002/status",
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function(data, status, xhr) {
            $("#tabellaCompletati").empty();
            completi = data;
            mostraLista(completi, "tabellaCompletati");
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
            $("#tabellaNonCompletati").empty();
            incompleti = data;
            mostraLista(incompleti, "tabellaNonCompletati");
        },
        error: function() {
            console.log("errore");
        }
    });
}

function mostraLista(list, idTabella) {
    if (idTabella == "tabellaCompletati") {
        list = ordinaPerData(list);
    }
    list.forEach(function(element) {

        var tabella = document.getElementById(idTabella);
        var row = tabella.insertRow();
        var cell1 = row.insertCell();
        var cell2 = row.insertCell();
        var cell3 = row.insertCell();
        cell1.innerHTML = element["_id"];
        cell2.innerHTML = element.merce;

        if (idTabella == "tabellaNonCompletati") {
            cell3.innerHTML = "<button class=\"btn btn-success\" style=\"color:black\" id=\"" + element["_id"] + "\"><b>RIDE</b></button> ";
        } else {
            var cell4 = row.insertCell();
            var cell5 = row.insertCell();
            cell4.innerHTML = "[" + formatDate(element["startDate"]) + "]";
            cell4.style.color = "rgb(126, 0, 0)";
            if (element.status == "CONSEGNATO") {
                cell3.innerHTML = "<b>" + "OK" + "</b>";
                cell5.innerHTML = "[" + formatDate(element["endDate"]) + "]";
                cell5.style.color = "rgb(2, 0, 126)";
            } else {
                cell3.innerHTML = "<b>" + "Riding" + "</b>";
                cell5.innerHTML = '<img src="css/mygif/loading.gif" />';
            }
        }
    });

    $(".btn-success").click(function() {
        var id = this.id;
        $.ajax({
            url: "http://212.237.32.76:3002/start/" + id,
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function(data, status, xhr) {
                completati();
                nonCompletati();
            },
            error: function() {
                console.log("errore");
            }
        });

    });
}

function ordinaPerData(list) {
    var orderList = [];
    //object --> array
    list.forEach(function(element, i) {
        orderList.push(Object.entries(element));
    });
    //ordina
    orderList.sort(function(a, b) {
        return (moment(b[3][1]) - moment(a[3][1]))
    });
    //array --> object
    orderList.forEach(function(element, i) {
        element.forEach(function(element2) {
            list[i][element2[0]] = element2[1];
        });
    });
    return list;
}

function formatDate(date) {
    var myDate = new Date(date);
    var x = (myDate + "").split(" ");
    var result = x[4] + "-" + x[1] + x[2];
    return result;
}