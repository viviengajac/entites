import { grille } from "./main.js";

export class Pt {
    constructor(x, y) {
        this.x = x,
        this.y = y
    }
}

export class Cellule extends Pt {
    constructor(x, y, taille) {
        super(x, y),
        this.taille = taille,
        this.clr = null,
        this.type_entite = null,    // de 0 à 3, correspond à l'indice du tableau dans grille.entites
        this.id_entite = null,  // indice de l'entité dans le tableau des entités du type
        this.est_apercu = false
    }
    definir_contour() {
        let x_min = this.x * this.taille;
        let y_min = this.y * this.taille;
        let delta = this.taille;
        grille.ctx.beginPath();
        grille.ctx.moveTo(x_min, y_min);
        grille.ctx.lineTo(x_min + delta, y_min);
        grille.ctx.lineTo(x_min + delta, y_min + delta);
        grille.ctx.lineTo(x_min, y_min + delta);
        grille.ctx.lineTo(x_min, y_min);
        grille.ctx.closePath();
    }
    remplir(clr, apercu, entite, num_segment, sommet = false) {
        this.definir_contour();
        grille.ctx.fillStyle = clr;
        grille.ctx.fill();
        this.est_apercu = apercu;
        if (entite != undefined) {
            this.type_entite = entite.type;
            this.id_entite = entite.id;
            this.clr = clr;
            if (num_segment != undefined) this.num_segment = num_segment;
            else delete this.num_segment;
            if (entite.type == 3 && !sommet) {  // si l'entité est un polygone et que la cellule traitée n'est pas un sommet
                if (this.udcie == "u") this.udcie ="c";
                else if (this.udcie == "c") this.udcie = "d";
            }
        }
    }
    vider() {
        grille.ctx.clearRect(this.x * this.taille, this.y * this.taille, this.taille, this.taille);
        if (this.est_apercu) this.est_apercu = false;
    }
}