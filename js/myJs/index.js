$(document).ready(function() {
    completi = 0;
    incompleti = 0;
    aggiorna = true;
    stopAggiornamento = false;
    $("#home").hide();
    paginaTabella = 0;
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
        //setto il numero di pagine 
        numeroPagine = Math.ceil(list.length / 10);
        //setto il num max di elementi sulla pagina 
        list.forEach(function(element, i) {
            if ((paginaTabella + i) >= list.length || i >= 10) {
                return false;
            }
            var riga = "";
            riga += ("<tr>");
            riga += ("<td>" + list[paginaTabella + i]["_id"] + "</td>");
            riga += ("<td>" + list[paginaTabella + i]["merce"] + "</td>");
            if (list[paginaTabella + i]["status"] == "CONSEGNATO") {
                riga += ("<td><b>OK</b></td>");
                riga += ("<td style=\"color:rgb(126, 0, 0)\">[" + formatDate(list[paginaTabella + i]["startDate"]) + "]</td>");
                riga += ("<td style=\"color:rgb(2, 0, 126)\">[" + formatDate(list[paginaTabella + i]["endDate"]) + "]</td>");
            } else {
                riga += ("<td><b>Riding</b></td>");
                riga += ("<td style=\"color:rgb(126, 0, 0)\">[" + formatDate(list[paginaTabella + i]["startDate"]) + "]</td>");
                riga += ("<td><img src=\"css/mygif/loading.gif\" /></td>");
            }
            riga += ("</tr>");
            $("#tabellaCompletati").append(riga);
        });
    } else {
        list.forEach(function(element, i) {
            var riga = "";
            riga += ("<tr>");
            riga += ("<td>" + element["_id"] + "</td>");
            riga += ("<td>" + element["merce"] + "</td>");
            riga += ("<td> <button class=\"btn btn-success\" style=\"color:black\" id=\"" + element["_id"] + "\"><b>RIDE</b></button> </td>");
            riga += ("</tr>");
            $("#tabellaNonCompletati").append(riga);
        });
    }

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
    $(function() {
        window.pagObj = $('#pagination').twbsPagination({
            totalPages: numeroPagine,
            visiblePages: 3,
            onPageClick: function(event, page) {
                $("#tabellaCompletati").empty();
                paginaTabella = (page - 1) * 10;
                console.log("cambio pag");
                mostraLista(completi, "tabellaCompletati");
            }
        }).on('page', function(event, page) {
            console.info(page + ' (from event listening)');
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