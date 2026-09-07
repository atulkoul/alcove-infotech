/* ==========================================
   Search Module
========================================== */

function initializeSearch(){

    const search =
        document.getElementById("searchInput");

    search.addEventListener("keyup", ()=>{

        const keyword =
            search.value.toLowerCase();

        const filtered =
            candidates.filter(c =>

                (c.candidateId || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (c.candidateName || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (c.client || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (c.role || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (c.recruiter || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (c.mobile || "")
                .toLowerCase()
                .includes(keyword)

            );

        renderFilteredTable(filtered);

    });

}