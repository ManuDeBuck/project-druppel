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

    constructor(){

    }

}