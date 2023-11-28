import { Pt } from "./cellule.js";
import { Entite } from "./entite.js";
import { Grille } from "./grille.js";
import { UI } from "./ui.js";

export const ui = new UI();
ui.initialiser();
window.changer_mode = (val) => ui.changer_mode(val);

export const grille = new Grille();
grille.initialiser();
window.modifier_grille = () => grille.modifier_grille();

window.addEventListener("change", (e) => {
    switch(e.target.id) {
        case "clrCan":
            grille.changer_couleur();
        break;
        case "clrCont":
            ui.recuperer_clr_cont();
            if (grille.selection != null) grille.modifier_entite(grille.selection);
        break;
        case "clrRemp":
            ui.recuperer_clr_remp();
            //console.log(grille.selection);
            if (grille.selection != null && grille.selection.type == 3) {
                grille.remplir_polygone(grille.selection);
                grille.selection.remplissage = ui.clr_remp;
            }
        break;
        case "listeEntites":
            ui.changer_mode(6);
        break;
    }
});

let indice_derniere_cellule_cible = null;
window.addEventListener("mousemove", (e) => {
    switch(e.target.id) {
        case "canvas":
            let indice_cellule = grille.calc_indice_cellule(e.offsetX, e.offsetY);
            if (indice_cellule != undefined && indice_cellule != indice_derniere_cellule_cible) {
                let cellule_cible = grille.trouver_cellule(indice_cellule);
                indice_derniere_cellule_cible = indice_cellule;
                grille.effacer_cellules_apercu();
                cellule_cible.remplir(ui.clr_cont, true);
                ui.coord_cellule_survolee.textContent = `${cellule_cible.x};${cellule_cible.y}`;
                ui.id_cellule_survolee.textContent = indice_cellule;
                ui.typeEntite.textContent = cellule_cible.type_entite;
                ui.idEntite.textContent = cellule_cible.id_entite;
                ui.numSegment.textContent = cellule_cible.num_segment;
                ui.etatUdcie.textContent = cellule_cible.udcie;
                if (grille.temp_entite != null) {
                    let cible = new Pt(cellule_cible.x, cellule_cible.y);
                    grille.tracer_segment(grille.temp_entite.sommets[grille.temp_entite.sommets.length - 1], cible, true);
                }
            }
        break;
        default:
            ui.coord_cellule_survolee.textContent = `-;-`;
            ui.id_cellule_survolee.textContent = `-`;
            ui.typeEntite.textContent = `-`;
            ui.idEntite.textContent = `-`;
            ui.numSegment.textContent = `-`;
            ui.etatUdcie.textContent =`-`;
            if (indice_derniere_cellule_cible != null) {
                let derniere_cellule_survolee = grille.trouver_cellule(indice_derniere_cellule_cible);
                grille.rafraichir_cellule(derniere_cellule_survolee);
                indice_derniere_cellule_cible = null;
            }
        break;
    }
});
window.addEventListener("click", (e) => {
    switch(e.target.id) {
        case "canvas":
            let cellule_cliquee = grille.trouver_cellule(grille.calc_indice_cellule(e.offsetX, e.offsetY));
            if (ui.mode_actif < 4) {    // on doit créer une entité
                if (grille.temp_entite == null) {
                    let entite = new Entite(ui.mode_actif, grille.entites[ui.mode_actif].length, ui.clr_cont, new Pt(cellule_cliquee.x, cellule_cliquee.y));  
                    grille.creer_entite(entite);
                    cellule_cliquee.remplir(ui.clr_cont, false, entite);
                    if (ui.mode_actif > 0) grille.temp_entite = entite;
                }
                else {
                    console.log(grille.temp_entite.sommets.length);
                    if (ui.mode_actif < 3) {
                        grille.temp_entite.sommets.push(new Pt(cellule_cliquee.x, cellule_cliquee.y));
                        grille.tracer_segment(grille.temp_entite.sommets[grille.temp_entite.sommets.length - 2], grille.temp_entite.sommets[grille.temp_entite.sommets.length - 1], false, grille.temp_entite);
                    }
                    else if (!grille.apercu_est_invalide && cellule_cliquee.type_entite != grille.temp_entite.type && cellule_cliquee.id_entite != grille.temp_entite.id) {
                        grille.temp_entite.sommets.push(new Pt(cellule_cliquee.x, cellule_cliquee.y));
                        grille.tracer_segment(grille.temp_entite.sommets[grille.temp_entite.sommets.length - 2], grille.temp_entite.sommets[grille.temp_entite.sommets.length - 1], false, grille.temp_entite, grille.temp_entite.sommets.length - 2);
                    }
                    if (ui.mode_actif == 1) {
                        grille.temp_entite = null;
                    }
                }
            }
            else {
                switch(ui.mode_actif) {
                    case 4:
                        if (cellule_cliquee.type_entite == 3) {    // on a cliqué sur le contour d'un polygone
                            let entite = grille.entites[cellule_cliquee.type_entite][cellule_cliquee.id_entite];
                            entite.remplissage = ui.clr_remp;
                            grille.remplir_polygone(entite);
                        }
                    break;
                    case 6:
                        console.log(cellule_cliquee);
                    break;
                }
            }
        break;
    }
});


