const TRANSLATION_API = "https://api.mymemory.translated.net/get";

export async function translateText(
    text,
    sourceLanguage = "en",
    targetLanguage = "ar",
) {
    const value = text.trim();

    if (!value) {
        return "";
    }

    const url = new URL(TRANSLATION_API);

    url.searchParams.set("q", value);
    url.searchParams.set("langpair", `${sourceLanguage}|${targetLanguage}`);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Translation request failed");
    }

    const data = await response.json();

    if (data.responseStatus !== 200) {
        throw new Error(data.responseDetails || "Translation failed");
    }

    return data.responseData?.translatedText || "";
}
