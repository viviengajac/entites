import { Cellule } from "./cellule.js";
import { ui } from "./main.js";

export class Grille {
    constructor() {
        this.cellules = [],
        this.entites = [
            [],
            [],
            [],
            [],
        ],
        this.temp_entite = null,
        this.selection = null
    }
    initialiser() {
        this.canvas = document.getElementById("canvas");
        this.canvas.style.background = "#ffffff";
        this.ctx = this.canvas.getContext("2d");
        this.modifier_grille();
        this.changer_couleur();
    }
    reset() {
        this.cellules = [];
        this.entites = [
            [],
            [],
            [],
            [],
        ];
        ui.vider_select();
    }
    modifier_grille() {
        this.taille_cellules = Number(document.getElementById("tailleCellules").value);
        this.nb_cellules_x = Number(document.getElementById("largCan").value) / this.taille_cellules;
        this.nb_cellules_y = Number(document.getElementById("hautCan").value) / this.taille_cellules;
        this.adapter_canvas();
        this.reset();
        this.generer_cellules();
    }
    adapter_canvas() {
        this.canvas.width = this.taille_cellules * this.nb_cellules_x;
        this.canvas.height = this.taille_cellules * this.nb_cellules_y;
    }
    changer_couleur() {
        this.clr = document.getElementById("clrCan").value;
        this.canvas.style.background = this.clr;
    }
    generer_cellules() {
        for (let y = 0; y < this.nb_cellules_y; y++) {
            for (let x = 0; x < this.nb_cellules_x; x++) {
                let cellule = new Cellule(x, y, this.taille_cellules);
                this.cellules.push(cellule);
            }
        }
    }
    calc_indice_cellule(x, y) {
        let cx = parseInt(x / this.taille_cellules);
        let cy = parseInt(y / this.taille_cellules);
        let indice = cy * this.nb_cellules_x + cx;
        if (indice < this.cellules.length)
            return indice;
    }
    trouver_cellule(indice) {
        if (this.cellules[indice] != undefined)
            return this.cellules[indice];
    }
    effacer_cellules_apercu() {
        this.cellules.filter(cellule => cellule.est_apercu).forEach(cellule => {
            this.rafraichir_cellule(cellule);
        });
    }
    rafraichir_cellule(cellule) {   /// redonne à la cellule son état avant le mode éphémère
        if (cellule.type_entite == null) cellule.vider();   // cellule sans entité
        else cellule.remplir(cellule.clr);
        /* else {
            let clr = null;
            if (this.mode_apercu) clr = ui.clr_cont;    // 
            else if () clr = this.entites[cellule.type_entite][cellule.id_entite].clr;
            cellule.remplir(clr);
        } */
    }
    creer_entite(entite) {
        this.entites[entite.type].push(entite);
        //console.log(this.entites);
        this.ajouter_entite_liste(entite);
    }
    ajouter_entite_liste(entite) {
        //console.log(entite);
        /* let lib;
        let id;
        switch (entite.type) {
            case 0:
                lib = `Point #${entite.id}`;
                id = `pt${entite.id}`;
            break;
            case 1:
                lib = `Ligne #${entite.id}`;
                id = `li${entite.id}`;
            break;
            case 2:
                lib = `Polyligne #${entite.id}`;
                id = `pl${entite.id}`;
            break;
            case 3:
                lib = `Polygone #${entite.id}`;
                id = `pg${entite.id}`;
            break;
        } */
        let param = ui.identifiant_entite(entite);
        let lib = param[0];
        let id = param[1];
        let option = document.createElement("option");
        option.setAttribute("id", `${id}`);
        option.textContent = lib;
        ui.listeEntites.appendChild(option);
        ui.listeEntites.value = lib;
    }
    selectionner_entite(type, id) {
        //console.log(type+ ";" + id);
        let entite = this.entites[type][id];
        this.selection = entite;
        console.log(this.selection);
        ui.modifier_clr_cont(entite.clr);
        if (entite.type == 3) {
            if (entite.remplissage == null) {
                ui.modifier_clr_remp(this.canvas.style.background);
                this.dessiner_polygone(entite);
            }
            else {
                ui.modifier_clr_remp(entite.remplissage);
                this.remplir_polygone(entite);
            }
        }
        else this.dessiner_entite(entite);
    }
    modifier_entite(entite) {
        entite.clr = ui.clr_cont;
        if (entite.type == 3) this.dessiner_polygone(entite);
        else this.dessiner_entite(entite);
    }
    dessiner_entite(entite) {
        for (let i = 0; i < entite.sommets.length; i++) {
            let sommet = entite.sommets[i];
            let cellule_sommet = this.trouver_cellule(this.calc_indice_cellule(sommet.x * this.taille_cellules, sommet.y * this.taille_cellules));
            cellule_sommet.remplir(ui.clr_cont, false, entite);
            if (cellule_sommet.num_segment != undefined) delete cellule_sommet.num_segment;
            if (i < entite.sommets.length - 1) this.tracer_segment(sommet, entite.sommets[i + 1], false, entite);
        }
    }
    remplir_polygone(entite) {
        //entite.remplissage = ui.clr_remp;
        let limites = this.definir_limites_polygone(entite);
        let x_min = limites[0];
        let x_max = limites[1];
        let y_min = limites[2];
        let y_max = limites[3];
        for (let x = x_min; x <= x_max; x++) {
            for (let y = y_min; y <= y_max; y++) {
                let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                cellule.udcie = "u";
                //cellule.type_entite = undefined; // je ne sais pas à quoi servait cette ligne, elle génère un bug
            }
        }
        this.dessiner_polygone(entite);

        for (let x = x_min; x <= x_max; x++) {
            let yb_min = y_max;
            let yb_max = y_min;
            for (let y = y_min; y <= y_max && yb_min == y_max; y++) {
                let cellule_balayee = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                if (cellule_balayee.id_entite == entite.id) yb_min = cellule_balayee.y;
            }
            for (let y = y_max; y >= y_min && yb_max == y_min; y--) {
                let cellule_balayee = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                if (cellule_balayee.id_entite == entite.id) yb_max = cellule_balayee.y;
            }
            //console.log("yb_min_max="+yb_min+";"+yb_max);

            if (yb_min < yb_max) {
                let ei = 0;
                let nb_cont = 0;
                let num_segment = -1;
                for (let y = yb_min; y < yb_max; y++) {
                    let cellule_balayee = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));

                    if (cellule_balayee.udcie == "c" && cellule_balayee.num_segment != num_segment) {
                        nb_cont++;
                        //console.log("nb_cont="+nb_cont);
                        num_segment = cellule_balayee.num_segment;
                    }
                    else if (cellule_balayee.udcie == "u") {
                        if (nb_cont % 2 == 1) ei = 1 - ei;
                        if (ei == 1) cellule_balayee.remplir(ui.clr_remp, false, entite);
                        nb_cont = 0;
                        num_segment = -1;
                    }
                }
            }
        }
    }
    definir_limites_polygone(entite) {
        let x_min = this.taille_cellules * this.nb_cellules_x;
        let x_max = 0;
        let y_min = this.taille_cellules * this.nb_cellules_y;
        let y_max = 0;
        for (let i = 0; i < entite.sommets.length; i++) {
            let pt = entite.sommets[i];
            if (pt.x < x_min) x_min = pt.x;
            if (pt.x > x_max) x_max = pt.x;
            if (pt.y < y_min) y_min = pt.y;
            if (pt.y > y_max) y_max = pt.y;
        }
       //console.log("xmin="+x_min+" ;xmax="+x_max+" :ymin="+y_min+" ;ymax="+y_max);
        return [x_min, x_max, y_min, y_max];
    }
    dessiner_polygone(entite) {
        for (let i = 0; i < entite.sommets.length; i++) {
            let sommet = entite.sommets[i];
            let cellule_sommet = this.trouver_cellule(this.calc_indice_cellule(sommet.x * this.taille_cellules, sommet.y * this.taille_cellules));
            cellule_sommet.remplir(ui.clr_cont, false, entite, i, true);
            //if (i == 0) cellule_sommet.udcie = "c";
            if (i < entite.sommets.length - 1) this.tracer_segment(sommet, entite.sommets[i + 1], false, entite, i);
        }
        this.tracer_segment(entite.sommets[entite.sommets.length - 1], entite.sommets[0], false, entite, entite.sommets.length - 1);
        
        // on doit redéfinir le numéro de segment du premier sommet du polygone
        let sommet = entite.sommets[0];
        this.trouver_cellule(this.calc_indice_cellule(sommet.x * this.taille_cellules, sommet.y * this.taille_cellules)).num_segment = 0;

        // traitement des sommets
        for (let i = 0; i < entite.sommets.length; i++) {
            let sommet = entite.sommets[i];
            let cellule_sommet = this.trouver_cellule(this.calc_indice_cellule(sommet.x * this.taille_cellules, sommet.y * this.taille_cellules));
            let sommet_precedent_x;
            let sommet_suivant_x;
            if (i == 0) {
                sommet_precedent_x = entite.sommets[entite.sommets.length - 1].x;
                sommet_suivant_x = entite.sommets[1].x;
            }
            else if (i < entite.sommets.length - 1) {
                sommet_precedent_x = entite.sommets[i - 1].x;
                sommet_suivant_x = entite.sommets[i + 1].x;
            }
            else {
                sommet_precedent_x = entite.sommets[i - 1].x;
                sommet_suivant_x = entite.sommets[0].x;
            }
            if ((sommet.x < sommet_precedent_x && sommet.x < sommet_suivant_x) || (sommet.x > sommet_precedent_x && sommet.x > sommet_suivant_x)) cellule_sommet.udcie = "d";
        }

        // traitement des segments verticaux
        for (let i = 0; i < entite.sommets.length; i++) {
            let sommet = entite.sommets[i];
            let cellule_sommet = this.trouver_cellule(this.calc_indice_cellule(sommet.x * this.taille_cellules, sommet.y * this.taille_cellules));
            let sommet_suivant;
            if (i < entite.sommets.length - 2) {
                sommet_suivant = entite.sommets[i + 1];
            }
            else {
                sommet_suivant = entite.sommets[0];
            }
            let sommet_suivant_x = sommet_suivant.x;

            if (sommet.x == sommet_suivant_x) {
                let sommet_precedent;
                let sommet_plus_2;
                if (i == 0) {
                    sommet_precedent = entite.sommets[entite.sommets.length - 1];
                    sommet_plus_2 = entite.sommets[i + 2];
                }
                else if (i > 0 && i < entite.sommets.length - 2) {
                    sommet_precedent = entite.sommets[i - 1];
                    sommet_plus_2 = entite.sommets[i + 2];
                }
                else if (i == entite.sommets.length - 2) {
                    sommet_precedent = entite.sommets[i - 1];
                    sommet_plus_2 = entite.sommets[0];
                }
                else if (i == entite.sommets.length - 1) {
                    sommet_precedent = entite.sommets[i - 1];
                    sommet_plus_2 = entite.sommets[1];
                }
                
                let sommet_precedent_x = sommet_precedent.x;
                let sommet_plus_2_x = sommet_plus_2.x;

                if ((sommet.x < sommet_precedent_x && sommet.x < sommet_plus_2_x) || (sommet.x > sommet_precedent_x && sommet.x > sommet_plus_2_x)) {
                    cellule_sommet.udcie = "d";
                    this.tracer_segment(sommet, sommet_suivant, false, entite, i);
                }
            }

            if (i > 0 && i < entite.sommets.length - 2) {
                let sommet_suivant = entite.sommets[i + 1];
                let sommet_suivant_x = sommet_suivant.x;
                if (sommet.x == sommet_suivant_x) {
                    let sommet_precedent = entite.sommets[i - 1];
                    let sommet_precedent_x = sommet_precedent.x;
                    let sommet_plus_2 = entite.sommets[i + 2];
                    let sommet_plus_2_x = sommet_plus_2.x;
                    if ((sommet.x < sommet_precedent_x && sommet.x < sommet_plus_2_x) || (sommet.x > sommet_precedent_x && sommet.x > sommet_plus_2_x)) {
                        cellule_sommet.udcie = "d";
                        this.tracer_segment(sommet, sommet_suivant, false, entite, i);
                    }
                }
            }
        }

        // traitement des cellules voisines d'un sommet et à la verticale du sommet
        for (let i = 0; i < entite.sommets.length; i++) {
            let sommet = entite.sommets[i];
            let cellule_sommet = this.trouver_cellule(this.calc_indice_cellule(sommet.x * this.taille_cellules, sommet.y * this.taille_cellules));
            this.verifier_cellules_voisines_haut(cellule_sommet, entite);
            this.verifier_cellules_voisines_bas(cellule_sommet, entite);
        }
    }
    verifier_cellules_voisines_haut(sommet, entite) {
        if (sommet.y > 0) {
            let cellule_dessus = this.trouver_cellule(this.calc_indice_cellule(sommet.x * this.taille_cellules, (sommet.y - 1) * this.taille_cellules));
            if (cellule_dessus.type_entite == entite.type && cellule_dessus.id_entite == entite.id) {
                cellule_dessus.udcie = sommet.udcie;
                cellule_dessus.num_segment = sommet.num_segment;
                this.verifier_cellules_voisines_haut(cellule_dessus, entite);
            }
        }
    }
    verifier_cellules_voisines_bas(sommet, entite) {
        if (sommet.y < this.nb_cellules_y - 1) {
            let cellule_dessous = this.trouver_cellule(this.calc_indice_cellule(sommet.x * this.taille_cellules, (sommet.y + 1) * this.taille_cellules));
            if (cellule_dessous.type_entite == entite.type && cellule_dessous.id_entite == entite.id) {
                cellule_dessous.udcie = sommet.udcie;
                cellule_dessous.num_segment = sommet.num_segment;
                this.verifier_cellules_voisines_bas(cellule_dessous, entite);
            }
        }
    }
    tracer_segment(pt1, pt2, apercu, entite, num_segment) {
        //console.log(num_segment);
        let x1 = pt1.x;
        let y1 = pt1.y;
        let x2 = pt2.x;
        let y2 = pt2.y;
        let dx = x2 - x1;
        if (dx < 0) dx *= -1;
        let dy = y2 - y1;
        if (dy < 0) dy *= -1;
        let x = x1;
        let y = y1;
    //console.log("tracer_segment");
    //console.log(entite);
        //this.trouver_cellule(this.calc_indice_cellule(pt1.x * this.taille_cellules, pt1.y * this.taille_cellules)).remplir(ui.clr_cont, apercu, entite, num_segment);
    // x croissant vers la droite ; y croissant vers le bas
        if (x2 > x1 && y2 <= y1 && dx > dy) { // octant 1 OK
            //console.log("octant 1");
            let e = -dx;
            let eh = dy * 2;
            let ev = -dx * 2;
            for (let x = x1 ; x < x2; x++) {
                if (x != x1) {
                    let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                    if (apercu && this.temp_entite.type == 3 && this.verifier_croisement_segments(cellule) == 1) return;
                    cellule.remplir(ui.clr_cont, apercu, entite, num_segment);
                }
                if ((e += eh) >= 0) {
                    y -= 1;
                    e = e + ev;
                }
            }
        }
        else if (x2 > x1 && y2 <= y1 && dx <= dy) { // octant 2 OK
            //console.log("octant 2");
            let e = -dy;
            let eh = dx * 2;
            let ev = -dy * 2;
            for (let y = y1 ; y > y2; y--) {
                if (y != y1) {
                    let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                    if (apercu && this.temp_entite.type == 3 && this.verifier_croisement_segments(cellule) == 1) return;
                    cellule.remplir(ui.clr_cont, apercu, entite, num_segment);
                }
                if ((e += eh) >= 0) {
                    x += 1;
                    e = e + ev;
                }
            }
        }
        else if (x2 <= x1 && y2 < y1 && dx < dy) { // octant 3 OK
            //console.log("octant 3");
            let e = -dy;
            let eh = dx * 2;
            let ev = -dy * 2;
            for (let y = y1 ; y > y2; y--) {
                if (y != y1) {
                    let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                    if (apercu && this.temp_entite.type == 3 && this.verifier_croisement_segments(cellule) == 1) return;
                    cellule.remplir(ui.clr_cont, apercu, entite, num_segment);
                }
                if ((e += eh) >= 0) {
                    x -= 1;
                    e = e + ev;
                }
            }
        }
        else if (x2 < x1 && y2 < y1 && dx >= dy) { // octant 4 OK
            //console.log("octant 4");
            let e = -dx;
            let eh = dy * 2;
            let ev = -dx * 2;
            for (let x = x1 ; x > x2; x--) {
                if (x != x1) {
                    let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                    if (apercu && this.temp_entite.type == 3 && this.verifier_croisement_segments(cellule) == 1) return;
                    cellule.remplir(ui.clr_cont, apercu, entite, num_segment);
                }
                if ((e += eh) >= 0) {
                    y -= 1;
                    e = e + ev;
                }
            }
        }
        else if (x2 < x1 && y2 >= y1 && dx > dy) { // octant 5 OK
            //console.log("octant 5");
            let e = -dx;
            let eh = dy * 2;
            let ev = -dx * 2;
            for (let x = x1 ; x > x2; x--) {
                if (x != x1) {
                    let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                    if (apercu && this.temp_entite.type == 3 && this.verifier_croisement_segments(cellule) == 1) return;
                    cellule.remplir(ui.clr_cont, apercu, entite, num_segment);
                }
                if ((e += eh) >= 0) {
                    y += 1;
                    e = e + ev;
                }
            }
        }
        else if (x2 < x1 && y2 > y1 && dx <= dy) { // octant 6 OK
            //console.log("octant 6");
            let e = -dy;
            let eh = dx * 2;
            let ev = -dy * 2;
            for (let y = y1 ; y < y2; y++) {
                if (y != y1) {
                    let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                    if (apercu && this.temp_entite.type == 3 && this.verifier_croisement_segments(cellule) == 1) return;
                    cellule.remplir(ui.clr_cont, apercu, entite, num_segment);
                }
                if ((e += eh) >= 0) {
                    x -= 1;
                    e = e + ev;
                }
            }
        }
        else if (x2 >= x1 && y2 > y1 && dx < dy) { // octant 7 OK
            //console.log("octant 7");
            let e = -dy;
            let eh = dx * 2;
            let ev = -dy * 2;
            for (let y = y1 ; y < y2; y++) {
                if (y != y1) {
                    let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                    if (apercu && this.temp_entite.type == 3 && this.verifier_croisement_segments(cellule) == 1) return;
                    cellule.remplir(ui.clr_cont, apercu, entite, num_segment);
                }
                if ((e += eh) >= 0) {
                    x += 1;
                    e = e + ev;
                }
            }
        }
        else if (x2 > x1 && y2 > y1 && dx >= dy) { // octant 8 OK
            //console.log("octant 8");
            let e = -dx;
            let eh = dy * 2;
            let ev = -dx * 2;
            for (let x = x1 ; x < x2; x++) {
                if (x != x1) {
                    let cellule = this.trouver_cellule(this.calc_indice_cellule(x * this.taille_cellules, y * this.taille_cellules));
                    if (apercu && this.temp_entite.type == 3 && this.verifier_croisement_segments(cellule) == 1) return;
                    cellule.remplir(ui.clr_cont, apercu, entite, num_segment);
                }
                if ((e += eh) >= 0) {
                    y += 1;
                    e = e + ev;
                }
            }
        }
        this.trouver_cellule(this.calc_indice_cellule(pt2.x * this.taille_cellules, pt2.y * this.taille_cellules)).remplir(ui.clr_cont, apercu, entite, num_segment);
    }
    verifier_croisement_segments(cellule) {
        let num_segment = this.temp_entite.sommets.length - 1;
        if (cellule.type_entite == this.temp_entite.type && cellule.id_entite == this.temp_entite.id && cellule.num_segment < num_segment - 1) {
            this.apercu_est_invalide = true;
            return 1;
        }
        else {
            this.apercu_est_invalide = false;
        }
    }
}