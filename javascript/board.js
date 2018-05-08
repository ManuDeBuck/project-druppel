Function.prototype.method = function(name, func) {

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

};

class Spelbord {

    constructor(args){
        if(args.grootte < 2){
            throw {
                name: "AssertionError",
                message: "Bord moet ten minste grotte 2 hebben"
            }
        }
        this.grootte = args.grootte;

        this.bordselector = args.bordselector;

        this.kleurselector = args.kleurselector;

        this.$spelbord = $(this.bordselector);

        this.$options = $(this.kleurselector);

        this.$teller = $(args.tellerselector);

        this.createGrid()

    }

    createGrid(){

        fetch('cgi-bin/script.py?ACTIE=new&GROOTTE=' + this.grootte.toString())
                        .then(response => response.json())
                        .then(res => {

                            this.adaptGrid(res);

                            this.adaptOptions(res);

                            $(".druppel", this.$spelbord).click(this.klikDruppel.bind(this));

                            this.json = res;
                        });
    }

    klikDruppel(event){

        let kleur = $( "#opties" ).val();

        fetch('cgi-bin/script.py?ACTIE=action&BOARD=' + JSON.stringify(this.json) + "&COLOR=" + kleur + "&LOCATION=[0,0]")
            .then(response => response.json())
            .then(res => {

                this.adaptGrid(res);

                this.adaptOptions(res);

                $(".druppel", this.$spelbord).click(this.klikDruppel.bind(this));

                this.json = res;
            })
    }

    adaptGrid(json){
        let tabel = json["board"];
        let toevoeg = "";
        for(let i = 0; i < tabel.length; i++){
            let rij = tabel[i];
            for(let j = 0; j < rij.length; j++){
                toevoeg += `<td><div class="druppel" data-kleur="${rij[j]}" style="background-color:${rij[j]}"></div></td>`;
            }
            if(i !== tabel.length - 1){
                toevoeg += "</tr><tr>";
            }
        }
        this.$spelbord.html("<table><tr>" + toevoeg + "</tr></table>");
    }

    adaptOptions(json){
        this.$options.empty();
        let options = json["moves"];
        for(let i = 0; i < options.length; i++){
            this.$options.append($("<option></option>")
                .attr("value",options[i])
                .css("color", options[i])
                .text(options[i]));
        }
    }

    adaptTeller(json){

        this.$teller.html("a");
    }

}