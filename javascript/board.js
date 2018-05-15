// momenteel nog niet nodig, kan mogelijks verwijderd worden.
/* Function.prototype.method = function(name, func) {

    if (!this.prototype.hasOwnProperty(name)) {
        Object.defineProperty(
            this.prototype,
            name,
            {
                value: func,
                enumerable: false
            }
        );
    }

    return this;

}; */

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

        // zet de grootte van het spelbord, dit roept ook initialisatie aan van het spelbord
        this.setGrootte(args.grootte);

    }

    createGrid(){

        fetch('cgi-bin/script.py?ACTIE=new&GROOTTE=' + this.grootte.toString())
                        .then(response => response.json())
                        .then(res => {

                            this.adaptGrid(res);

                            this.adaptOptions(res);

                            this.adaptTeller(res);

                            $(".druppel", this.$spelbord).click(this.klikDruppel.bind(this));

                            this.json = res;

                        });
    }

    klikDruppel(event){

        let kleur = $( "#opties" ).val();

        if(kleur === null) return;

        fetch('cgi-bin/script.py?ACTIE=action&BOARD=' + JSON.stringify(this.json) + "&COLOR=" + kleur + "&LOCATION=[0,0]")
            .then(response => response.json())
            .then(res => {

                this.adaptGrid(res);

                this.adaptOptions(res);

                this.adaptTeller(res);

                if(res["message"] !== ""){
                    this.showMessage(res);
                }

                $(".druppel", this.$spelbord).click(this.klikDruppel.bind(this));

                this.json = res;
            })
    }

    adaptGrid(json){
        let tabel = json["board"];
        let toevoeg = "";
        let diam = (400 / tabel.length);
        for(let i = 0; i < tabel.length; i++){
            let rij = tabel[i];
            for(let j = 0; j < rij.length; j++){
                toevoeg += `<td><div class="druppel" data-kleur="${rij[j]}" style="background-color:${rij[j]}; width: ${diam}px; height: ${diam}px;"></div></td>`;
            }
            if(i !== tabel.length - 1){
                toevoeg += "</tr><tr>";
            }
        }
        this.$spelbord.html("<table class='spelbordtable'><tr>" + toevoeg + "</tr></table>");
    }

    adaptOptions(json){
        this.$options.empty();
        let options = json["moves"];
        for(let i = 0; i < options.length; i++){
            this.$options.append($("<option></option>")
                .attr("value",options[i])
                .attr("class","kleuroptie")
                .css("height", 380 / this.grootte)
                .css("background-color", options[i])
                .css("color", options[i])
                .text(options[i]));
        }
        this.$options.attr("size", options.length + Math.ceil(0.20 * options.length));
    }

    adaptTeller(json){

        this.$teller.html('Score: ' + json["score"]);

    }

    showMessage(json){

        this.timer = window.setTimeout(() => {
            $("#dialoogvensterTitel").text("Congratulations")
            $("#dialoogvensterTekst").text(json["message"]);
            $("#dialoogvenster").modal();
            this.createGrid();
        }, 500);

    }

    setGrootte(grootte){

        if(grootte < 2 || grootte > 15){
            throw {
                name: "AssertionError",
                message: "Bord moet ten minste grootte 2 hebben, en maximaal grootte 15"
            }
        }

        this.grootte = grootte;

        this.createGrid();

    }

}