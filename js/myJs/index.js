$(document).ready(function() {
    completi = 0;
    incompleti = 0;
    numeroPagine = 0;
    elementiMostrati = 10;
    indexPartenzaTabella = 0;
    paginaAttuale = 1;
    aggiorna = true;
    stopAggiornamento = false;
    $("#home").hide();
    $("#campoDropdown").hide();
    $("#pagination").hide();
    creaPulsanti();
});

$("#list").click(function() {
    $("#list").hide();
    $("#home").show();
    $("#pagination").show();
    $("#campoDropdown").show();
    caricamentoCambioPagina(true);
    completati();
    nonCompletati();
    stopAggiornamento = false;
    if (aggiorna) {
        aggiornaTabelle();
    }
    aggiorna = false;
});
$("#home").click(function() {
    $("#list").show();
    $("#home").hide();
    $("#pagination").hide();
    $("#campoDropdown").hide();
    stopAggiornamento = true;
    aggiorna = true;
    caricamentoCambioPagina(true);
    $("#tabellaNonCompletati").empty();
    $("#tabellaCompletati").empty();
    caricamentoCambioPagina(false, 250);
});

function aggiornaTabelle() {
    setTimeout(function() {
        if (!stopAggiornamento) {
            completati();
            nonCompletati();
            aggiornaTabelle();
        }
    }, 20000);
}

function quantitaElementiMostrati() {
    $(".dropdown-item").click(function() {
        $("#quantita").html("[" + this.id + "]");
        elementiMostrati = this.id;
        numeroPagine = Math.ceil(completi.length / elementiMostrati);
        if (numeroPagine < paginaAttuale) {
            paginaAttuale = numeroPagine;
        }
        indexPartenzaTabella = (paginaAttuale - 1) * elementiMostrati;
        completati();
        nonCompletati();
    });
}

function creaPulsanti() {
    $('.dropdown-toggle').dropdown();
    var button = "";
    $.each(new Array(20), function(i) {
        button += '<button class="dropdown-item" type="button" id="' + ((i + 1) * 5) + '"style="color:rgb(255, 230, 0)">' + ((i + 1) * 5) + '</button>';
    });
    $("#dropdownOption").append(button);
    quantitaElementiMostrati();
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
            tabellaCompletati();
            numeroPagine = Math.ceil(completi.length / elementiMostrati);
            impaginazione();
            setTimeout(function() {
                caricamentoCambioPagina(false, 250);
            }, 250);
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
            tabellaNonCompletati();
        },
        error: function() {
            console.log("errore");
        }
    });
}

function tabellaCompletati() {
    completi = ordinaPerData();

    completi.forEach(function(element, i) {
        if ((indexPartenzaTabella + i) >= completi.length || i >= elementiMostrati) {
            return false;
        }
        var riga = "";
        riga += ("<tr>");
        riga += ("<td>" + completi[indexPartenzaTabella + i]["_id"] + "</td>");
        riga += ("<td>" + completi[indexPartenzaTabella + i]["merce"] + "</td>");
        if (completi[indexPartenzaTabella + i]["status"] == "CONSEGNATO") {
            riga += ("<td><b>OK</b></td>");
            riga += ("<td style=\"color:rgb(126, 0, 0)\">[" + moment(completi[indexPartenzaTabella + i]["startDate"]).format('H:mm:ss-MMMDD') + "]</td>");
            riga += ("<td style=\"color:rgb(2, 0, 126)\">[" + moment(completi[indexPartenzaTabella + i]["endDate"]).format('H:mm:ss-MMMDD') + "]</td>");
        } else {
            riga += ("<td><b>Riding</b></td>");
            riga += ("<td style=\"color:rgb(126, 0, 0)\">[" + moment(completi[indexPartenzaTabella + i]["startDate"]).format('H:mm:ss-MMMDD') + "]</td>");
            riga += ("<td><img src=\"css/mygif/loading.gif\" /></td>");
        }
        riga += ("</tr>");
        $("#tabellaCompletati").append(riga);
    });


}

function tabellaNonCompletati() {
    incompleti.forEach(function(element, i) {
        var riga = "";
        riga += ("<tr>");
        riga += ("<td>" + element["_id"] + "</td>");
        riga += ("<td>" + element["merce"] + "</td>");
        riga += ("<td> <button class=\"btn btn-success\" style=\"color:black\" id=\"" + element["_id"] + "\"><b>RIDE</b></button> </td>");
        riga += ("</tr>");
        $("#tabellaNonCompletati").append(riga);
    });
    mettiInRide();
}

function impaginazione() {
    $("#campoImpaginazione").html("");
    $("#campoImpaginazione").append('<ul class="pagination" id="pagination" style="display: flex; justify-content: center;"></ul>');
    $(function() {
        $('#pagination').twbsPagination({
            totalPages: numeroPagine,
            visiblePages: 5,
            initiateStartPageClick: false,
            startPage: paginaAttuale,
            onPageClick: function(event, page) {
                $("#tabellaCompletati").empty();
                paginaAttuale = page;
                indexPartenzaTabella = (paginaAttuale - 1) * elementiMostrati;
                tabellaCompletati();
            }
        })
    });
}

function mettiInRide() {
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

function ordinaPerData() {
    completi.sort(function(a, b) { return (moment(b.startDate) - moment(a.startDate)) });
    return completi;
}