import os

import google.generativeai as genai
from dotenv import load_dotenv


load_dotenv()


def _configure_genai():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing. Add it to your .env file.")
    genai.configure(api_key=api_key)


def _normalize_model_name(name: str) -> str:
    # The SDK accepts both "models/x" and "x" in different places.
    return name.replace("models/", "", 1)


def _pick_supported_model() -> str:
    preferred = [
        os.getenv("GEMINI_MODEL", "").strip(),
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
    ]

    ordered = []
    for name in preferred:
        if name and name not in ordered:
            ordered.append(name)

    try:
        available = list(genai.list_models())
    except Exception:
        # If listing fails, return best-effort default.
        return ordered[0]

    supported = set()
    for model in available:
        methods = getattr(model, "supported_generation_methods", []) or []
        if "generateContent" in methods:
            supported.add(_normalize_model_name(model.name))

    for candidate in ordered:
        if _normalize_model_name(candidate) in supported:
            return candidate

    # Final fallback: first model that supports generateContent.
    for name in supported:
        if "gemini" in name:
            return name

    raise RuntimeError("No Gemini model with generateContent support was found for this API key.")


def get_model():
    _configure_genai()
    model_name = _pick_supported_model()
    return genai.GenerativeModel(model_name)


def get_model_candidates():
    _configure_genai()

    preferred = [
        os.getenv("GEMINI_MODEL", "").strip(),
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
    ]

    ordered = []
    for name in preferred:
        if name and name not in ordered:
            ordered.append(name)

    try:
        available = list(genai.list_models())
    except Exception:
        return ordered

    supported = []
    for model in available:
        methods = getattr(model, "supported_generation_methods", []) or []
        if "generateContent" in methods:
            supported.append(_normalize_model_name(model.name))

    candidates = []
    for candidate in ordered:
        normalized = _normalize_model_name(candidate)
        if normalized in supported and candidate not in candidates:
            candidates.append(candidate)

    for name in supported:
        if name not in candidates:
            candidates.append(name)

    if not candidates:
        raise RuntimeError("No Gemini model with generateContent support was found for this API key.")

    return candidates


def generate_with_model_fallbacks(prompt: str):
    last_error = None
    for model_name in get_model_candidates():
        try:
            model = genai.GenerativeModel(model_name)
            return model.generate_content(prompt)
        except Exception as error:
            last_error = error
            message = str(error).lower()
            if "quota" in message or "429" in message or "rate" in message or "resource exhausted" in message:
                continue
            if "not found" in message or "unsupported" in message or "invalid" in message:
                continue
            raise

    raise RuntimeError(f"All Gemini models failed: {last_error}")
