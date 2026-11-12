"""Feature extraction and preprocessing pipelines for FEVER/FEVEROUS fact verification."""

import re
from typing import Any, Dict, List, Sequence
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.preprocessing import StandardScaler

NEGATION_WORDS = frozenset({
    "not", "no", "never", "none", "nothing", "neither", "nor", "zero",
    "only", "except", "without", "failed", "cannot", "cant", "can't",
    "didnt", "didn't", "doesnt", "doesn't", "dont", "don't",
    "wasnt", "wasn't", "werent", "weren't", "isnt", "isn't",
    "arent", "aren't", "unable", "false", "refuted", "denied",
})

SUPERLATIVE_WORDS = frozenset({
    "first", "last", "only", "most", "least", "largest", "smallest",
    "always", "every", "all", "sole", "exclusively", "single", "entirely",
})

WORD_RE = re.compile(r"[a-zA-Z0-9']+")
DIGIT_RE = re.compile(r"\d+")


def _clean_wikipedia_token(raw: str) -> str:
    return (
        raw.replace("_", " ")
        .replace("-LRB-", "(")
        .replace("-RRB-", ")")
        .replace("-LSB-", "[")
        .replace("-RSB-", "]")
        .strip()
    )


def extract_evidence_text(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract normalized evidence text and structural evidence counters from a FEVER,
    FEVEROUS, or live NexusIQ record without touching label/verifiability leakage fields.
    """
    raw_evidence = record.get("evidence")
    evidence_chunks: List[str] = []
    evidence_sets_count = 0
    evidence_items_count = 0
    has_table = 0
    has_sentence = 0

    if isinstance(raw_evidence, list):
        for group in raw_evidence:
            # FEVEROUS format: {"content": [...], "context": {id: [...]}}
            if isinstance(group, dict):
                evidence_sets_count += 1
                content_ids = group.get("content", []) or []
                context = group.get("context", {}) or {}
                evidence_items_count += len(content_ids)

                for cid in content_ids:
                    cid_str = str(cid)
                    if "_cell_" in cid_str or "_table_" in cid_str:
                        has_table = 1
                    elif "_sentence_" in cid_str:
                        has_sentence = 1
                    # Extract page title / structural cue without raw ID clutter
                    cleaned = _clean_wikipedia_token(cid_str.split("_sentence_")[0].split("_cell_")[0])
                    if cleaned:
                        evidence_chunks.append(cleaned)

                if isinstance(context, dict):
                    for vals in context.values():
                        if isinstance(vals, list):
                            for v in vals:
                                text = _clean_wikipedia_token(str(v).replace("_title", "").replace("_section_", " section "))
                                if text:
                                    evidence_chunks.append(text)
            # FEVER format: [[annotation_id, evidence_id, page_title, sentence_idx], ...]
            elif isinstance(group, list):
                valid_in_group = 0
                for entry in group:
                    if isinstance(entry, list) and len(entry) >= 3 and entry[2]:
                        valid_in_group += 1
                        evidence_items_count += 1
                        has_sentence = 1
                        evidence_chunks.append(_clean_wikipedia_token(str(entry[2])))
                if valid_in_group > 0:
                    evidence_sets_count += 1

    # Also support direct string evidence text (for live inference / Tavily snippets)
    direct_ev = record.get("evidence_text")
    if isinstance(direct_ev, str) and direct_ev.strip():
        evidence_chunks.append(direct_ev.strip())
        if evidence_items_count == 0:
            evidence_items_count = 1
            evidence_sets_count = 1
            has_sentence = 1

    # Deduplicate chunks while preserving order
    deduped = list(dict.fromkeys(c for c in evidence_chunks if c))
    evidence_text = " | ".join(deduped)

    return {
        "evidence_text": evidence_text,
        "has_evidence": 1 if evidence_text else 0,
        "evidence_sets_count": evidence_sets_count,
        "evidence_items_count": evidence_items_count,
        "has_table_evidence": has_table,
        "has_sentence_evidence": has_sentence,
    }


def extract_record_fields(record: Dict[str, Any], dataset_source: str = "UNKNOWN") -> Dict[str, Any]:
    """Convert raw dataset or inference payload into standardized model input dict."""
    claim = str(record.get("claim") or "").strip()
    ev_info = extract_evidence_text(record)
    return {
        "claim": claim,
        "evidence_text": ev_info["evidence_text"],
        "has_evidence": ev_info["has_evidence"],
        "evidence_sets_count": ev_info["evidence_sets_count"],
        "evidence_items_count": ev_info["evidence_items_count"],
        "has_table_evidence": ev_info["has_table_evidence"],
        "has_sentence_evidence": ev_info["has_sentence_evidence"],
        "dataset_source": dataset_source,
    }


class TextFieldSelector(BaseEstimator, TransformerMixin):
    """Selects a specific string field from a sequence of sample dictionaries."""

    def __init__(self, key: str):
        self.key = key

    def fit(self, X: Sequence[Dict[str, Any]], y: Any = None):
        return self

    def transform(self, X: Sequence[Dict[str, Any]]) -> List[str]:
        return [str(row.get(self.key) or "") for row in X]


class FactVerificationNumericExtractor(BaseEstimator, TransformerMixin):
    """
    Extracts claim complexity, negation cues, missing-evidence flags,
    and claim-evidence overlap features into a standardized numeric array.
    """

    def fit(self, X: Sequence[Dict[str, Any]], y: Any = None):
        return self

    def transform(self, X: Sequence[Dict[str, Any]]) -> np.ndarray:
        rows = np.zeros((len(X), 13), dtype=np.float64)
        for i, row in enumerate(X):
            claim = str(row.get("claim") or "")
            evidence = str(row.get("evidence_text") or "")

            claim_words = WORD_RE.findall(claim)
            ev_words = WORD_RE.findall(evidence)

            claim_lower = [w.lower() for w in claim_words]
            ev_lower_set = {w.lower() for w in ev_words if len(w) > 2}

            claim_word_count = len(claim_words)
            claim_char_len = len(claim)
            avg_word_len = (sum(len(w) for w in claim_words) / claim_word_count) if claim_word_count else 0.0
            digit_count = len(DIGIT_RE.findall(claim))
            negation_count = sum(1 for w in claim_lower if w in NEGATION_WORDS)
            superlative_count = sum(1 for w in claim_lower if w in SUPERLATIVE_WORDS)
            uppercase_ratio = (
                sum(1 for w in claim_words if w[:1].isupper()) / claim_word_count
                if claim_word_count
                else 0.0
            )

            ev_char_len = len(evidence)
            ev_word_count = len(ev_words)
            is_evidence_missing = 1.0 if ev_char_len == 0 else 0.0

            content_tokens = [w for w in claim_lower if len(w) > 2]
            overlap_ratio = (
                sum(1 for w in content_tokens if w in ev_lower_set) / len(content_tokens)
                if content_tokens and ev_lower_set
                else 0.0
            )

            rows[i, 0] = claim_word_count
            rows[i, 1] = claim_char_len
            rows[i, 2] = avg_word_len
            rows[i, 3] = digit_count
            rows[i, 4] = negation_count
            rows[i, 5] = superlative_count
            rows[i, 6] = uppercase_ratio
            rows[i, 7] = ev_char_len
            rows[i, 8] = ev_word_count
            rows[i, 9] = is_evidence_missing
            rows[i, 10] = float(row.get("evidence_items_count", 0))
            rows[i, 11] = float(row.get("has_table_evidence", 0))
            rows[i, 12] = overlap_ratio

        return rows


def build_feature_pipeline() -> FeatureUnion:
    """
    Construct the combined sparse text + scaled numeric feature union.
    Must ONLY be fitted on training (development) splits to avoid data leakage.
    """
    return FeatureUnion(
        transformer_list=[
            (
                "claim_word_tfidf",
                Pipeline([
                    ("select", TextFieldSelector("claim")),
                    (
                        "tfidf",
                        TfidfVectorizer(
                            ngram_range=(1, 2),
                            max_features=35000,
                            sublinear_tf=True,
                            min_df=2,
                        ),
                    ),
                ]),
            ),
            (
                "claim_char_tfidf",
                Pipeline([
                    ("select", TextFieldSelector("claim")),
                    (
                        "tfidf",
                        TfidfVectorizer(
                            analyzer="char_wb",
                            ngram_range=(3, 5),
                            max_features=25000,
                            sublinear_tf=True,
                            min_df=3,
                        ),
                    ),
                ]),
            ),
            (
                "evidence_word_tfidf",
                Pipeline([
                    ("select", TextFieldSelector("evidence_text")),
                    (
                        "tfidf",
                        TfidfVectorizer(
                            ngram_range=(1, 2),
                            max_features=20000,
                            sublinear_tf=True,
                            min_df=2,
                        ),
                    ),
                ]),
            ),
            (
                "numeric_features",
                Pipeline([
                    ("extract", FactVerificationNumericExtractor()),
                    ("scale", StandardScaler()),
                ]),
            ),
        ]
    )

