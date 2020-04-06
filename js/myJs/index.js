const ordineDataSu = "&#128070 PARTENZA&#128070";
const ordineDataGiu = "&#128071 PARTENZA&#128071";
const ordineDataNeutro = "&#128073 PARTENZA&#128072";
const ordineMerceSu = "&#128070 MERCE&#128070";
const ordineMerceGiu = "&#128071 MERCE&#128071";
const ordineMerceNeutro = "&#128073 MERCE&#128072";
const crescente = 1;
const decrescente = -1;

$(document).ready(function() {
    completi = 0;
    incompleti = 0;
    numeroPagine = 0;
    elementiMostrati = 10;
    indexPartenzaTabella = 0;
    ordinaDecrescente = true;
    headerTabellaData = ordineDataNeutro;
    headerTabellaMerce = ordineMerceNeutro;
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
            completati();
            nonCompletati();
            aggiornaTabelle();
        }
    }, 20000);
}

//COSTRUZIONE TABELLE{
function tabellaCompletati() {
    var head = headTabellaCompletatiHTML();
    $("#tabellaCompletati").append(head);
    ordinaTabella();
    completi.forEach(function(element, i) {
        if ((indexPartenzaTabella + i) >= completi.length || i >= elementiMostrati) {
            return false;
        }
        var riga = bodyTabellaHTML(completi, indexPartenzaTabella + i);
        $("#tabellaCompletati").append(riga);
    });


}

function tabellaNonCompletati() {
    incompleti.forEach(function(element, i) {
        var riga = bodyTabellaHTML(incompleti, i);
        $("#tabellaNonCompletati").append(riga);
    });
    mettiInRide();
}

//COSTRUZIONE TABELLE -> HTML{
function headTabellaCompletatiHTML() {
    var head = "<tr class=\"head-color\">";
    head += "<th>ID</th>";
    head += "<th id=\"headMerce\">" + headerTabellaMerce + "</th>";
    head += "<th>STATO</th>";
    head += "<th id=\"headData\">" + headerTabellaData + "</th>";
    head += "<th>CONSEGNA</th>";
    head += "</tr>";
    return head;
}

function bodyTabellaHTML(list, i) {
    var riga = "<tr";
    riga += alternaColoreRiga(i);
    riga += ">";
    riga += ("<td>" + list[i]["_id"] + "</td>");
    riga += ("<td>" + list[i]["merce"] + "</td>");
    //3° colonna tabella non completati
    if (list[i]["status"] == "CREATED") {
        riga += ("<td> <button class=\"btn btn-success color-btnRide\" id=\"" + list[i]["_id"] + "\"><b>RIDE</b></button> </td>");
    }
    //3°,4°,5° colonna tabella completati [CONSEGNATO]
    if (list[i]["status"] == "CONSEGNATO") {
        riga += ("<td><b>OK</b></td>");
        riga += quartaColonna(i);
        riga += ("<td class=\"color-dateE\">[" + moment(list[i]["endDate"]).format('H:mm:ss-MMMDD') + "]</td>");
    }
    //3°,4°,5° colonna tabella completati [CONSEGNA]
    if (list[i]["status"] == "CONSEGNA") {
        riga += ("<td><b>Riding</b></td>");
        riga += quartaColonna(i);
        riga += ("<td><img src=\"css/mygif/loading.gif\" /></td>");
    }
    riga += ("</tr>");
    return riga;
}

function alternaColoreRiga(i) {
    if (i % 2 == 0) {
        return (" class=\"row-color\"");
    }
    return "";
}

function quartaColonna(i) {
    return "<td class=\"color-dateS\">[" + moment(completi[i]["startDate"]).format('H:mm:ss-MMMDD') + "]</td>";
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
    $("#campoImpaginazione").html('<ul class="pagination pos-pag" id="pagination" ></ul>');
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
function ordinaPerData(i) {
    completi.sort(function(a, b) { return (moment(a.startDate) - moment(b.startDate)) * i });
}

function ordinaPerMerce(i) {
    completi.sort(function(a, b) {
        if (b.merce[0] > a.merce[0]) {
            return -1 * i;
        }
        return 1 * i;
    });
}

function alternareOrdineMerce() {
    $("#headMerce").click(function() {
        if (ordinaDecrescente) {
            setDati(ordineDataNeutro, ordineMerceSu, "MERCE_DECRESCENTE");
            completati();
            nonCompletati();
            ordinaDecrescente = false;
        } else {
            setDati(ordineDataNeutro, ordineMerceGiu, "MERCE_CRESCENTE");
            completati();
            nonCompletati();
            ordinaDecrescente = true;
        }
    });
}

function alternareOrdineData() {
    $("#headData").click(function() {
        if (ordinaDecrescente) {
            setDati(ordineDataSu, ordineMerceNeutro, "DATA_DECRESCENTE");
            completati();
            nonCompletati();
            ordinaDecrescente = false;
        } else {
            setDati(ordineDataGiu, ordineMerceNeutro, "DATA_CRESCENTE");
            completati();
            nonCompletati();
            ordinaDecrescente = true;
        }
    });
}

function ordinaTabella() {
    switch (tipoDiOrdinamento) {
        case "DATA_CRESCENTE":
            ordinaPerData(crescente);
            break;
        case "DATA_DECRESCENTE":
            ordinaPerData(decrescente);
            break;
        case "MERCE_CRESCENTE":
            ordinaPerMerce(crescente);
            break;
        case "MERCE_DECRESCENTE":
            ordinaPerMerce(decrescente);
    }
    alternareOrdineData();
    alternareOrdineMerce();
}

function setDati(datiData, datiMerce, datiOrdina) {
    $("#headData").html(datiData);
    $("#headMerce").html(datiMerce);
    headerTabellaData = datiData;
    headerTabellaMerce = datiMerce;
    tipoDiOrdinamento = datiOrdina;
}