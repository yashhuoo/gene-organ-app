def get_high_risk_organs(gene_symbol: str) -> list[str]:
    """Return suggested high-risk organs/syndromes for known genes."""
    normalized_gene = gene_symbol.strip().upper()

    risk_map: dict[str, list[str]] = {
        "BRCA1": ["Breast", "Ovary", "Prostate", "Pancreas"],
        "BRCA2": ["Breast", "Ovary", "Prostate", "Pancreas"],
        "TP53": ["Li-Fraumeni Syndrome", "Multi-organ", "Bone"],
        "APC": ["Colon", "Stomach"],
        "PAX2": ["Kidney", "Eye", "Nervous System"],
    }

    return risk_map.get(normalized_gene, [])
