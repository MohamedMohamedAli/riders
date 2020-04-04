$(document).ready(function() {
    completi = 0;
    incompleti = 0;
    numeroPagine = 0;
    elementiMostrati = 10;
    indexPartenzaTabella = 0;
    ordinaDecrescente = true;
    frecciaSu = "&#128070";
    frecciaGiu = "&#128071";
    frecciaDestra = "&#128073";
    frecciaSinistra = "&#128072";
    frecciaDestraData = "&#128072";
    frecciaSinistraData = "&#128073";
    frecciaDestraMerce = "&#128072";
    frecciaSinistraMerce = "&#128073";
    paginaAttuale = 1;
    aggiorna = true;
    stopAggiornamento = false;
    tipoDiOrdinamento = "";
    $("#home").hide();
    $("#textSelect").hide();
    $("#selectQuantita").hide();
    $("#pagination").hide();
    creaOption();
});
//PULSANTE LIST
$("#list").click(function() {
    $("#list").hide();
    $("#home").show();
    $("#pagination").show();
    $("#textSelect").show();
    $("#selectQuantita").show();
    caricamentoCambioPagina(true);
    completati();
    nonCompletati();
    stopAggiornamento = false;
    if (aggiorna) {
        aggiornaTabelle();
    }
    aggiorna = false;
});
//PULSANTE HOME
$("#home").click(function() {
    $("#list").show();
    $("#home").hide();
    $("#pagination").hide();
    $("#textSelect").hide();
    $("#selectQuantita").hide();
    stopAggiornamento = true;
    aggiorna = true;
    caricamentoCambioPagina(true);
    $("#tabellaNonCompletati").empty();
    $("#tabellaCompletati").empty();
    caricamentoCambioPagina(false, 250);
});
//AGGIORNAMENTO TABELLE OGNI 20 SEC
function aggiornaTabelle() {
    setTimeout(function() {
        if (!stopAggiornamento) {
            console.log("aggiorna");
            completati();
            nonCompletati();
            aggiornaTabelle();
        }
    }, 20000);
}

//COSTRUZIONE TABELLE{
function tabellaCompletati() {
    console.log("tabella completati");
    var head = headTabellaCompletati();
    $("#tabellaCompletati").append(head);
    alternareOrdineData();
    alternareOrdineMerce();
    console.log("tipo di ordinamento: " + tipoDiOrdinamento);
    switch (tipoDiOrdinamento) {
        case "DATA_CRESCENTE":
            console.log("case: DATA_CRESCENTE");
            ordinaPerDataCrescente();
            break;
        case "DATA_DECRESCENTE":
            console.log("case: DATA_DECRESCENTE");
            ordinaPerDataDecrescente();
            break;
        case "MERCE_CRESCENTE":
            console.log("case: MERCE_CRESCENTE");
            ordinaPerMerceCrescente();
            break;
        case "MERCE_DECRESCENTE":
            console.log("case: MERCE_DECRESCENTE");
            ordinaPerMerceDecrescente();
    }
    completi.forEach(function(element, i) {
        if ((indexPartenzaTabella + i) >= completi.length || i >= elementiMostrati) {
            return false;
        }
        var riga = bodyTabellaCompletati(indexPartenzaTabella + i);
        $("#tabellaCompletati").append(riga);
    });


}

function tabellaNonCompletati() {
    incompleti.forEach(function(element, i) {
        var riga = bodyTabellaNonCompletati(i);
        $("#tabellaNonCompletati").append(riga);
    });
    mettiInRide();
}

//COSTRUZIONE TABELLE -> HTML{
function headTabellaCompletati() {
    var head = "<tr style=\"background-color:rgba(0, 0, 0, 0.200)\">";
    head += "<th>ID</th>";
    head += "<th id=\"headMerce\">" + frecciaSinistraMerce + " MERCE" + frecciaDestraMerce + "</th>";
    head += "<th>STATO</th>";
    head += "<th id=\"headData\">" + frecciaSinistraData + " PARTENZA" + frecciaDestraData + "</th>";
    head += "<th>CONSEGNA</th>";
    head += "</tr>";
    return head;
}

function bodyTabellaCompletati(i) {
    var riga = "<tr";
    if (i % 2 != 0) {
        riga += (" style=\"background-color:rgb(51, 172, 51)\"");
    }
    riga += ">";
    riga += ("<td>" + completi[i]["_id"] + "</td>");
    riga += ("<td>" + completi[i]["merce"] + "</td>");
    if (completi[i]["status"] == "CONSEGNATO") {
        riga += ("<td><b>OK</b></td>");
        riga += quartaColonna(i);
        riga += ("<td style=\"color:rgb(2, 0, 126)\">[" + moment(completi[i]["endDate"]).format('H:mm:ss-MMMDD') + "]</td>");
    } else {
        riga += ("<td><b>Riding</b></td>");
        riga += quartaColonna(i);
        riga += ("<td><img src=\"css/mygif/loading.gif\" /></td>");
    }
    riga += ("</tr>");
    return riga;
}

function quartaColonna(i) {
    return "<td style=\"color:rgb(126, 0, 0)\">[" + moment(completi[i]["startDate"]).format('H:mm:ss-MMMDD') + "]</td>";
}

function bodyTabellaNonCompletati(i) {
    var riga = "<tr";
    if (i % 2 != 0) {
        riga += (" style=\"background-color:rgb(255, 199, 59);\"");
    }
    riga += ">";
    riga += ("<td>" + incompleti[i]["_id"] + "</td>");
    riga += ("<td>" + incompleti[i]["merce"] + "</td>");
    riga += ("<td> <button class=\"btn btn-success\" style=\"color:black\" id=\"" + incompleti[i]["_id"] + "\"><b>RIDE</b></button> </td>");
    riga += ("</tr>");
    return riga;
}
//}}

//CARICA DATI PER LE TABELLE {
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
//}

//CREAZIONE OPTION PER SELECT(riders in pagina)
function creaOption() {
    $('#selectQuantita').change();
    var option = "";
    $.each(new Array(20), function(i) {
        option += '<option value="' + ((i + 1) * 5) + '">' + ((i + 1) * 5) + '</option>';
    });
    $("#selectQuantita").append(option);
    $("#selectQuantita").val(elementiMostrati);
    quantitaElementiMostrati();
}
//CAMBIA QUANTITA' ELEMENTI MOSTRATI 
function quantitaElementiMostrati() {
    $("#selectQuantita").change(function() {
        elementiMostrati = $("#selectQuantita").val();
        numeroPagine = Math.ceil(completi.length / elementiMostrati);
        if (numeroPagine < paginaAttuale) {
            paginaAttuale = numeroPagine;
        }
        indexPartenzaTabella = (paginaAttuale - 1) * elementiMostrati;
        completati();
        nonCompletati();
    });
}
//SELEZIONA PAGINA DA MOSTRARE
function impaginazione() {
    $("#campoImpaginazione").html('<ul class="pagination" id="pagination" style="display: flex; justify-content: center;"></ul>');
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

//CONTROLLA SPEDIZIONE ORDINE
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

//ORDINAMENTO TABELLA

function ordinaPerDataDecrescente() {
    console.log("Data Decrescente");
    completi.sort(function(a, b) { return (moment(b.startDate) - moment(a.startDate)) });
    $("#headData").html(frecciaSu + " PARTENZA" + frecciaSu);
    $("#headMerce").html(frecciaDestra + " MERCE" + frecciaSinistra);
    assegnoValoreFrecce(frecciaSu, frecciaSu, frecciaDestra, frecciaSinistra);
    tipoDiOrdinamento = "DATA_DECRESCENTE";
}

function ordinaPerDataCrescente() {
    console.log("Data Crescente");
    completi.sort(function(a, b) { return (moment(a.startDate) - moment(b.startDate)) });
    $("#headData").html(frecciaGiu + " PARTENZA" + frecciaGiu);
    $("#headMerce").html(frecciaDestra + " MERCE" + frecciaSinistra);
    assegnoValoreFrecce(frecciaGiu, frecciaGiu, frecciaDestra, frecciaSinistra);
    tipoDiOrdinamento = "DATA_CRESCENTE";
}

function ordinaPerMerceDecrescente() {
    console.log("Merce Decrescente");
    completi.sort(function(a, b) {
        if (b.merce[0] > a.merce[0]) {
            return 1;
        }
        return -1;
    });
    console.log("posiziono freccia su merce");
    $("#headMerce").html(frecciaSu + " MERCE" + frecciaSu);
    $("#headData").html(frecciaDestra + " PARTENZA" + frecciaSinistra);
    assegnoValoreFrecce(frecciaDestra, frecciaSinistra, frecciaSu, frecciaSu);
    tipoDiOrdinamento = "MERCE_DECRESCENTE";
}

function ordinaPerMerceCrescente() {
    console.log("Merce Crescente");
    completi.sort(function(a, b) {
        if (b.merce[0] > a.merce[0]) {
            return -1;
        }
        return 1;
    });
    $("#headMerce").html(frecciaGiu + " MERCE" + frecciaGiu);
    $("#headData").html(frecciaDestra + " PARTENZA" + frecciaSinistra);
    assegnoValoreFrecce(frecciaDestra, frecciaSinistra, frecciaGiu, frecciaGiu);
    tipoDiOrdinamento = "MERCE_CRESCENTE";
}

function assegnoValoreFrecce(frecciaSinistraDataInput, frecciaDestraDataInput, frecciaSinistraMerceInput, frecciaDestraMerceInput) {
    frecciaDestraData = frecciaDestraDataInput;
    frecciaSinistraData = frecciaSinistraDataInput;
    frecciaDestraMerce = frecciaDestraMerceInput;
    frecciaSinistraMerce = frecciaSinistraMerceInput;
}

function alternareOrdineMerce() {
    $("#headMerce").click(function() {
        if (ordinaDecrescente) {
            ordinaPerMerceDecrescente();
            completati();
            nonCompletati();
            ordinaDecrescente = false;
        } else {
            ordinaPerMerceCrescente();
            completati();
            nonCompletati();
            ordinaDecrescente = true;
        }
    });
}

function alternareOrdineData() {
    $("#headData").click(function() {
        if (ordinaDecrescente) {
            ordinaPerDataDecrescente();
            completati();
            nonCompletati();
            ordinaDecrescente = false;
        } else {
            ordinaPerDataCrescente();
            completati();
            nonCompletati();
            ordinaDecrescente = true;
        }
    });
}