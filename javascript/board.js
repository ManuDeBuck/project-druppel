class Spelbord {

    constructor(args){

        // selector voor het huidige spelbord
        this.bordselector = args.bordselector;

        // selector voor het select attribuut op de webpagine
        this.kleurselector = args.kleurselector;

        // het hudige spelbord
        this.$spelbord = $(this.bordselector);

        // het select attribuut van het huidige spelbord
        this.$options = $(this.kleurselector);

        // de de score
        this.$teller = $(args.tellerselector);

        // Stel de grootte van het spelbord in, gebruikt voor de verhouding van de grootte van een cel tov het aantal cellen
        this.spelbordgrootte = args.spelbordgrootte;

        // Stel de grootte van een optie in, gebruikt voor verhouding van grootte van optie tov het aantal opties
        this.optiegrootte = args.optiegrootte;

        // Stel minimale en maximale grootte in
        this.mingrootte = args.mingrootte;
        this.maxgrootte = args.maxgrootte;

        // zet de grootte van het spelbord, dit roept ook initialisatie van het spelbord aan
        this.setGrootte(args.grootte);

        // Het huidig geselecteerde kleur, initieel leeg
        this.geselecteerdekleur = null;

    }

    /**
     * Maak een nieuw speel-grid op basis van de argumenten doorgegeven aan het object van de klasse Spelbord.
     */
    createGrid(){

        // Haal de data op van het CGI-script.
        fetch('cgi-bin/script.py?ACTIE=new&GROOTTE=' + this.grootte.toString())
            .then(response => response.json())
            .then(res => {

                this.verwerkData(res);

            });
    }

    /**
     * Verwerk de data ontvangen door het cgi-script.
     */
    verwerkData(res){

        // maak de cellen aan en initialiseer ze
        this.adaptGrid(res);

        // pas de verschilende select opties aan
        this.adaptOptions(res);

        // pas de scoreteller aan
        this.adaptTeller(res);

        // sla het ontvangen json object op voor later gebruik (bij een clickevent)
        this.json = res;

        // indien het spel over is, en een melding wordt meegegeven, toon deze
        if(res["message"] !== ""){
            this.showMessage(res);
        }
    }

    /**
     *  Verwerk de klik op een cel.
     */
    klikCell(event){

        // doe niets als er momenteel geen kleur geselecteerd is
        if(this.geselecteerdekleur !== null){

            // voer de actie uit, en pas alles aan afhankelijk van de data die geretourneerd wordt door het cgi-script
            fetch('cgi-bin/script.py?ACTIE=action&BOARD=' + JSON.stringify(this.json) + "&COLOR=" + this.geselecteerdekleur + "&LOCATION=[" + event.target.getAttribute("data-rij") + "," + event.target.getAttribute("data-kolom") + "]")
                .then(response => response.json())
                .then(res => {

                    this.verwerkData(res);

                })

        }

    }

    /**
     * Pas het speelveld aan afhankelijk van de data ontvangen door het cgi-script.
     */
    adaptGrid(json){

        // Tabel met de huidige bezetting van het bord
        let tabel = json["board"];

        let tabelinhoud = "";

        // Verdeel de totale ruimte gelijk over het aantal aanwezige cellen
        let diam = (this.spelbordgrootte / tabel.length);

        for(let i = 0; i < tabel.length; i++){

            let rij = tabel[i];

            for(let j = 0; j < rij.length; j++){

                tabelinhoud += `<td><div class="druppel" data-kleur="${rij[j]}" data-rij="${i}" data-kolom="${j}" style="background-color:${rij[j]};width: ${diam}px; height: ${diam}px;"></div></td>`;

            }

            // Bij het creëren van de laatste rij is het onnodig een nieuwe, lege rij aan te maken
            if(i !== tabel.length - 1) tabelinhoud += "</tr><tr>";

        }

        // stel de inhoud van het spelbord in
        this.$spelbord.html("<table class='spelbordtable'><tr>" + tabelinhoud + "</tr></table>");

        // Voeg een click-handler toe aan elke cel van het spelbord
        $(".druppel", this.$spelbord).click(this.klikCell.bind(this));

    }

    /**
     * Pas de select opties aan afhankelijk van de data meegegeven door het cgi-script.
     */
    adaptOptions(json){

        // leeg de opties
        this.$options.empty();

        // huidig mogelijke opties
        let options = json["moves"];

        // vul de opties in
        for(let i = 0; i < options.length; i++){

            // Voeg de kleur toe als een optie
            this.$options.append($('<div class="kleuroptie" style="background-color: ' + options[i] + ';"></div>')
                .attr('data-kleur',options[i])
                .css('height', this.optiegrootte / options.length)
                .click(this.pasKleurAan.bind(this))
            );

        }

        // Stel de totale lengte van het select attribuut, afhankelijk van het aantal opties (om een scrollbar te vermijden)
        this.$options.attr("size", options.length);
    }

    pasKleurAan(event){

        // Houd de huidig geselecteerde kleur bij
        this.geselecteerdekleur = event.target.getAttribute("data-kleur");

        // Alle andere elementen mogen geen merk meer hebben, dus alle selecties verwijderen
        $('.kleuroptie').removeClass('geselecteerd');

        // Geef het geselecteerde element duidelijk weer
        $(event.target).addClass('geselecteerd');

    }

    /**
     * Pas de teller aan afhankelijk van de huidige score
     */
    adaptTeller(json){

        this.$teller.html('Score: ' + json["score"]);

    }

    /**
     * Toont optioneel een melding in een modaalvenster indien het spel uitgespeeld is.
     */
    showMessage(json){

        // gebruik van een timer om de melding wat uit te stellen.
        this.timer = window.setTimeout(() => {
            $("#dialoogvensterTitel").text("Congratulations")
            $("#dialoogvensterTekst").text(json["message"]);
            $("#dialoogvenster").modal();
            this.createGrid();
        }, 500);

    }

    /**
     * Pas de grootte van het spelbord aan
     */
    setGrootte(grootte){

        // Ga na dat de grootte degelijk is.
        if(grootte < this.mingrootte || grootte > this.maxgrootte){
            throw {
                name: "AssertionError",
                message: "Bord moet ten minste grootte 2 hebben, en maximaal grootte 15"
            }
        }

        this.grootte = grootte;

        // na het aanpassen van de grootte moet de grid opnieuw gecreëerd worden
        this.createGrid();

    }

}