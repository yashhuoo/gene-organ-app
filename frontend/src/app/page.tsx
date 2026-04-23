"use client";

import { FormEvent, useState } from "react";

type PubMedResult = {
  id: string;
  title: string;
};

type SearchResponse = {
  gene: string;
  organ?: string;
  page?: number;
  suggested_organs: string[];
  results: PubMedResult[];
};

// This uses your Railway URL if it exists, otherwise defaults to local
const API_BASE_URL = "http://gene-organ-app-production.up.railway.app";

export default function HomePage() {
  const [gene, setGene] = useState("");
  const [submittedGene, setSubmittedGene] = useState("");
  const [selectedOrgan, setSelectedOrgan] = useState("");
  const [targetOrgans, setTargetOrgans] = useState<string[]>([]);
  const [results, setResults] = useState<PubMedResult[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGeneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedGene = gene.trim().toUpperCase();
    if (!normalizedGene) {
      setError("Please enter a gene symbol.");
      return;
    }

    setSubmittedGene(normalizedGene);
    setSelectedOrgan("");
    setResults([]);
    setCurrentPage(0);
    setError("");
    setLoading(true);

    try {
      // Correctly constructing the URL for your Railway/Local backend
      const url = new URL(`${API_BASE_URL}/search`);
      url.searchParams.set("gene", normalizedGene);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = (await response.json()) as SearchResponse;
      setTargetOrgans(data.suggested_organs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsForOrgan = async (organ: string, page: number) => {
    if (!submittedGene) return;

    setSelectedOrgan(organ);
    setCurrentPage(page);
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const url = new URL(`${API_BASE_URL}/search`);
      url.searchParams.set("gene", submittedGene);
      url.searchParams.set("organ", organ);
      url.searchParams.set("page", String(page));

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = (await response.json()) as SearchResponse;
      setResults(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch results.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (!selectedOrgan) return;
    fetchResultsForOrgan(selectedOrgan, currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (!selectedOrgan || currentPage === 0) return;
    fetchResultsForOrgan(selectedOrgan, currentPage - 1);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-semibold text-slate-900">Genomic Research Navigator</h1>

        <form onSubmit={handleGeneSubmit} className="mb-6 flex w-full">
          <input
            type="text"
            value={gene}
            onChange={(event) => setGene(event.target.value)}
            placeholder="Enter gene symbol (e.g., BRCA2)"
            className="w-full rounded-l-lg bg-white px-5 py-4 text-lg text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-r-lg bg-blue-900 px-6 py-4 text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {!!targetOrgans.length && (
          <div className="mb-6 flex flex-wrap gap-3">
            {targetOrgans.map((organ) => (
              <button
                key={organ}
                type="button"
                onClick={() => fetchResultsForOrgan(organ, 0)}
                disabled={loading}
                className="rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-200 disabled:opacity-60"
              >
                {organ}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mb-4 text-red-600 font-medium">{error}</p>}

        {!!submittedGene && !!selectedOrgan && (
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Results for {submittedGene} in {selectedOrgan}
          </h2>
        )}

        {results.map((result) => (
          <article
            key={result.id}
            className="mb-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{result.title}</h3>
            <p className="mt-2 text-slate-500 font-mono text-sm">PMID: {result.id}</p>
          </article>
        ))}

        {!!selectedOrgan && results.length > 0 && (
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={loading || currentPage === 0}
              className="rounded-lg border border-blue-600 bg-white px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-blue-200 disabled:text-blue-300"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={loading}
              className="rounded-lg border border-blue-600 bg-white px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-blue-200 disabled:text-blue-300"
            >
              Next Page
            </button>
          </div>
        )}
      </section>
    </main>
  );
}