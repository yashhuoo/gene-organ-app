from typing import Optional
import os
import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

# Import your custom services
from gene_risk_service import get_high_risk_organs
from pubmed_service import search_pubmed

app = FastAPI(title="Genomic API")

# 1. CORS - Handled once, correctly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. ROOT ROUTE - Only one instance
@app.get("/")
def read_root():
    return {"status": "online", "message": "Genomic API is Running"}

# 3. SEARCH ROUTE
@app.get("/search")
def search_articles(
    gene: str = Query(..., min_length=1),
    organ: Optional[str] = Query(default=None),
    page: int = Query(default=0, ge=0),
    offset: Optional[int] = Query(default=None, ge=0),
) -> dict[str, object]:
    gene = gene.strip().upper()
    
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

# 4. STARTUP LOGIC
if __name__ == "__main__":
    # Force Railway to use the assigned port, fallback to 8000 for local dev
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)