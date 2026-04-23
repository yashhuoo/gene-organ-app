from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from gene_risk_service import get_high_risk_organs
from pubmed_service import search_pubmed

app = FastAPI(title="Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Hello from FastAPI backend"}


@app.get("/search")
def search_articles(
    gene: str = Query(..., min_length=1),
    organ: Optional[str] = Query(default=None),
    page: int = Query(default=0, ge=0),
    offset: Optional[int] = Query(default=None, ge=0),
) -> dict[str, object]:
    gene = gene.strip().upper()
    print(f"Backend received gene: {gene}")

    resolved_page = offset if offset is not None else page
    retstart = resolved_page * 10
    suggested_organs = get_high_risk_organs(gene) or ["General Search"]

    if not organ or not organ.strip():
        return {
            "gene": gene,
            "page": resolved_page,
            "suggested_organs": suggested_organs,
            "results": [],
        }

    normalized_organ = organ.strip()
    results = search_pubmed(
        gene=gene,
        organ=normalized_organ,
        retstart=retstart,
        retmax=10,
    )
    return {
        "gene": gene,
        "page": resolved_page,
        "suggested_organs": suggested_organs,
        "organ": normalized_organ,
        "results": results,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
