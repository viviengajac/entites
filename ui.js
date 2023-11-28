import { grille } from "./main.js";

export class UI {
    constructor() {
        this.barres_modes = [],
        this.boutons_modes = [],
        this.mode_actif = 0,    // 0=point; 1=ligne; 2=polyligne; 3=polygone; 4=remplir; 5=vider; 6=sélection
        this.listeEntites = document.getElementById("listeEntites"),
        this.coord_cellule_survolee = document.getElementById("coordCellSurv"),
        this.id_cellule_survolee = document.getElementById("cellSurv"),
        this.typeEntite = document.getElementById("typeEntite"),
        this.idEntite = document.getElementById("idEntite"),
        this.numSegment = document.getElementById("numSegment"),
        this.etatUdcie = document.getElementById("etatUdcie")
    }
    initialiser() {
        this.recuperer_barres_modes();
        this.recuperer_boutons();
        this.recuperer_clr_cont();
        this.recuperer_clr_remp();
    }
    recuperer_barres_modes() {
        this.barres_modes.push(document.getElementById("barreEntites"));
        this.barres_modes.push(document.getElementById("barreRemplissage"));
        this.barres_modes.push(document.getElementById("barreSelection"));
    }
    recuperer_boutons() {
        this.barres_modes.forEach(barre => {
            let noeuds = barre.childNodes;
            noeuds.forEach(noeud => {
                if (noeud.nodeName == "INPUT") {
                    this.boutons_modes.push(noeud);
                }
            });
        });
    }
    modifier_clr_cont(clr) {
        document.getElementById("clrCont").value = clr;
        this.recuperer_clr_cont();
    }
    modifier_clr_remp(clr) {
        document.getElementById("clrRemp").value = clr;
        this.recuperer_clr_remp();
    }
    recuperer_clr_cont() {
        this.clr_cont = document.getElementById("clrCont").value;
    }
    recuperer_clr_remp() {
        this.clr_remp = document.getElementById("clrRemp").value;
    }
    changer_mode(val) {
        if (val == 4) {
            //console.log(grille.selection);
            if (grille.selection != null && grille.selection.type == 3) {
                grille.selection.remplissage = this.clr_remp;
                grille.remplir_polygone(grille.selection);
            }
        }
        if (val == 6) { // on vient de passer en mode sélection et on veut que l'entité sélectionnée dans la combo soit 
            if (this.listeEntites.childElementCount == 0) return;
            let param = this.recup_entite_dans_liste();
            let type = param[0];
            let id = param[1];
            grille.selectionner_entite(type, id);
        }
        else if (val != 4 && val != 6) grille.selection = null;
        if (grille.temp_entite) {
            if (grille.temp_entite.type == 3) {
                grille.tracer_segment(grille.temp_entite.sommets[grille.temp_entite.sommets.length - 1], grille.temp_entite.sommets[0], false, grille.temp_entite, grille.temp_entite.sommets.length - 2);
            }
            grille.temp_entite = null;
            grille.effacer_cellules_apercu();
        }
        if (val != 4) {
            this.maj_boutons_modes(val);
            this.mode_actif = val;
        }
    }
    maj_boutons_modes(val) {
        this.boutons_modes.forEach(bouton => bouton.classList.remove("btn-actif"));
        this.boutons_modes[val].classList.add("btn-actif");
    }
    vider_select() {
        let dernier_enf = this.listeEntites.lastChild;
        while (dernier_enf) {
            this.listeEntites.removeChild(dernier_enf);
            dernier_enf = this.listeEntites.lastChild;
        }
    }
    selectionner_entite(entite) {   // sert à mettre à jour la combo de liste d'entités après sélection d'une entité en cliquant dans la grille

    }
    identifiant_entite(entite) {
        let lib;
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
        }
        return [lib, id];
    }
    recup_entite_dans_liste() {
        let selection = listeEntites.options[listeEntites.selectedIndex].id;
        let type;
        switch (selection.substr(0, 2)) {
            case "pt":
                type = 0;
            break;
            case "li":
                type = 1;
            break;
            case "pl":
                type = 2;
            break;
            case "pg":
                type = 3;
            break;
        }
        let id = Number(selection.substr(2));
        return [type, id];
    }
}