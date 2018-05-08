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

        this.selector = args.selector;

        this.$spelbord = $(this.selector);

        this.createGrid()
    }

    createGrid(){

        let druppels = $.get('/cgi-bin/script.py',{'ACTIE' : "new", 'GROOTTE' : this.grootte.toString()}); // opvragen van cgi script
        console.log(druppels);
        /* const rooster = druppels.map((druppel, index) =>  {
            return `<div class="druppel" data-kleur = "${druppel}"></div>` + ((index % this.grootte === 0) ? "</tr><tr>" : "");
        });

        this.$spelbord.html("<table><tr>" + rooster + "</tr></table>"); */

        // $(".druppel", this.$spelbord).click(this.klikDruppel.bind(this));

    }
    
    klikDruppel(event){

        // do something

    }

}