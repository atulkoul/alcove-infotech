/* ==========================================
   Local Storage Module
========================================== */

function saveCandidates(){

    localStorage.setItem(
        "armsCandidates",
        JSON.stringify(candidates)
    );

}

function loadCandidates(){

    const data =
        localStorage.getItem("armsCandidates");

    if(data){

        candidates = JSON.parse(data);

    }
    else{

        candidates = [];

    }

}