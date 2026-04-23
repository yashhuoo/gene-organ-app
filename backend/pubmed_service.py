from Bio import Entrez


def search_pubmed(
    gene: str,
    organ: str,
    email: str = "example@example.com",
    retstart: int = 0,
    retmax: int = 10,
) -> list[dict[str, str]]:
    """Search PubMed for a gene-organ query and return article summaries."""
    Entrez.email = email
    normalized_organ = organ.strip().lower()
    query = gene if normalized_organ == "general search" else f"{gene} AND {organ}"

    with Entrez.esearch(
        db="pubmed", term=query, retstart=retstart, retmax=retmax
    ) as search_handle:
        search_result = Entrez.read(search_handle)

    id_list = search_result.get("IdList", [])
    if not id_list:
        return []

    with Entrez.efetch(db="pubmed", id=",".join(id_list), retmode="xml") as fetch_handle:
        article_data = Entrez.read(fetch_handle)

    results: list[dict[str, str]] = []
    for article_item in article_data.get("PubmedArticle", []):
        article = article_item.get("MedlineCitation", {}).get("Article", {})
        article_id = article_item.get("MedlineCitation", {}).get("PMID", "")
        title = article.get("ArticleTitle", "")
        if article_id and title:
            results.append({"id": str(article_id), "title": str(title)})

    return results
