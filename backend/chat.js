async function main() {
  const model = ai.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    // This system instruction keeps the AI acting like an SEO specialist
    systemInstruction: "You are an expert SEO strategist. When providing keywords, always categorize them by Search Intent (Informational, Transactional, Navigational), estimate Keyword Difficulty, and suggest semantic 'clusters' for content silos."
  });

  const chat = model.startChat({
    history: [], // You can add previous SEO sessions here to resume
  });

  // Turn 1: Broad Research
  let result = await chat.sendMessage("Give me 5 high-intent keywords for 'sustainable coffee beans'.");
  console.log("SEO Expert:", result.response.text());

  // Turn 2: Refining (The chat 'remembers' the previous list)
  result = await chat.sendMessage("Now, create a 3-article content silo based on that list to build topical authority.");
  console.log("\nContent Strategy:\n", result.response.text());
}

await main();