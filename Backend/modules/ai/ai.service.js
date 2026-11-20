import spotifyService from "../spotify/spotify.service.js";
import ChatMessage from "../../models/chat/chat.model.js";
import GeneratedPlaylist from "../../models/playlist/generatedPlaylist.model.js";

class AIService {
    constructor() {
        this.geminiApiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
        this.model = process.env.AI_MODEL || "gemini-2.5-flash";
    }

    /**
     * Executes prompt on Google Gemini REST API or falls back to smart music taste heuristics
     */
    async callLLM(prompt, systemInstruction = "") {
        if (!this.geminiApiKey) {
            console.warn("⚠️ AI_API_KEY not configured. Using intelligent rule-based music assistant engine.");
            return null;
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.geminiApiKey}`;
            const body = {
                contents: [
                    {
                        parts: [
                            ...(systemInstruction ? [{ text: `SYSTEM INSTRUCTION: ${systemInstruction}` }] : []),
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1500
                }
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const err = await response.text();
                console.error("Gemini API call failed:", response.status, err);
                return null;
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            return text || null;
        } catch (error) {
            console.error("Error communicating with Gemini LLM:", error.message);
            return null;
        }
    }

    /**
     * Retrieves user's Spotify listening taste context
     */
    async getUserMusicContext(user) {
        try {
            const [topTracks, topArtists, recentlyPlayed] = await Promise.all([
                spotifyService.getTopTracks(user, { limit: 15, time_range: "short_term" }).catch(() => ({ items: [] })),
                spotifyService.getTopArtists(user, { limit: 15, time_range: "medium_term" }).catch(() => ({ items: [] })),
                spotifyService.getRecentlyPlayed(user, { limit: 10 }).catch(() => ({ items: [] }))
            ]);

            const trackNames = (topTracks.items || []).map(t => `"${t.name}" by ${t.artists.map(a => a.name).join(", ")}`);
            const artistNames = (topArtists.items || []).map(a => `${a.name} (${(a.genres || []).slice(0, 3).join(", ")})`);
            const recentNames = (recentlyPlayed.items || []).map(item => `"${item.track?.name}" by ${item.track?.artists?.map(a => a.name).join(", ")}`);

            return {
                topTracks: trackNames,
                topArtists: artistNames,
                recentlyPlayed: recentNames
            };
        } catch (error) {
            return { topTracks: [], topArtists: [], recentlyPlayed: [] };
        }
    }

    /**
     * Conversational Music Assistant
     */
    async chat(user, message) {
        const musicContext = await this.getUserMusicContext(user);

        const systemInstruction = `You are Audix AI, an elite, charismatic, and deeply knowledgeable music assistant and sonic curator integrated into Spotify.
User's Listening Taste Profile:
- Top Artists & Genres: ${musicContext.topArtists.join("; ") || "Diverse catalog"}
- Current Favorite Tracks: ${musicContext.topTracks.join("; ") || "Eclectic taste"}
- Recently Played: ${musicContext.recentlyPlayed.join("; ") || "Various"}

Instructions:
1. Provide thoughtful, warm, and musically articulate answers.
2. Whenever you recommend songs, format them clearly as: Track: "Track Name" - Artist: "Artist Name" with a brief one-line reason why it matches their taste.
3. Recommend only real songs by real artists that can be verified on Spotify. Never fabricate artist names or track titles.
4. Keep answers engaging and concise.`;

        let reply = await this.callLLM(message, systemInstruction);

        if (!reply) {
            // High-quality smart contextual fallback
            const favoriteArtist = musicContext.topArtists[0] || "Arctic Monkeys, The Weeknd";
            reply = `Based on your recent listening profile featuring ${favoriteArtist}, here are curated recommendations suited for your vibe:

1. **"Midnight City"** by M83 — Euphoric synth textures with an anthemic nocturnal pulse.
2. **"Breathe Deeper"** by Tame Impala — Smooth psychedelic groove with irresistible basslines.
3. **"Starboy"** by The Weeknd — Punchy electro-pop production with iconic melodic delivery.
4. **"505"** by Arctic Monkeys — A brooding build-up into sheer sonic energy.

Would you like me to generate a complete custom playlist around any of these vibes?`;
        }

        // Validate and extract real Spotify tracks mentioned in reply or related to user's taste
        const recommendedTracks = await this.extractAndVerifyTracks(user, reply, musicContext);

        // Save conversation history to MongoDB
        await ChatMessage.create({
            userId: user.spotifyId,
            role: "user",
            content: message
        });

        const assistantMsg = await ChatMessage.create({
            userId: user.spotifyId,
            role: "assistant",
            content: reply,
            recommendedTracks
        });

        return {
            reply,
            recommendedTracks,
            messageId: assistantMsg._id
        };
    }

    /**
     * Search and verify mentioned tracks on Spotify API
     */
    async extractAndVerifyTracks(user, text, musicContext) {
        const tracks = [];
        // Regex to match "Song Name" by Artist or Track: "X" - Artist: Y
        const patterns = [
            /"([^"]+)"\s*(?:by|-)\s*([A-Za-z0-9\s&]+)/g,
            /\*\*([^*]+)\*\*\s*(?:by|-)\s*([A-Za-z0-9\s&]+)/g
        ];

        const queries = [];
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null && queries.length < 5) {
                const song = match[1].trim();
                const artist = match[2].trim().replace(/[.,\n].*$/, "");
                queries.push(`${song} ${artist}`);
            }
        }

        // If no direct song matched, use seed recommendations
        if (queries.length === 0 && musicContext.topTracks.length > 0) {
            queries.push(musicContext.topTracks[0].replace(/"/g, ""));
        }

        for (const q of queries.slice(0, 4)) {
            try {
                const searchRes = await spotifyService.search(user, q, { types: ["track"], limit: 1 });
                const trackItem = searchRes?.tracks?.items?.[0];
                if (trackItem) {
                    tracks.push({
                        id: trackItem.id,
                        name: trackItem.name,
                        artists: trackItem.artists.map(a => a.name),
                        album: trackItem.album?.name,
                        albumCover: trackItem.album?.images?.[0]?.url || "",
                        duration_ms: trackItem.duration_ms,
                        spotifyUrl: trackItem.external_urls?.spotify,
                        uri: trackItem.uri
                    });
                }
            } catch (err) {
                // Ignore search error for individual track
            }
        }

        return tracks;
    }

    /**
     * AI Playlist Generator
     */
    async generatePlaylist(user, prompt) {
        const musicContext = await this.getUserMusicContext(user);

        const promptText = `Generate a cohesive, expertly sequenced tracklist of 15 real, popular or high-quality songs on Spotify for the following prompt:
"${prompt}"

User taste context:
- Favorite artists: ${musicContext.topArtists.slice(0, 8).join(", ")}
- Top tracks: ${musicContext.topTracks.slice(0, 8).join(", ")}

Respond strictly with valid JSON only in this exact format:
{
  "title": "A catchy, creative playlist title",
  "description": "A compelling 1-2 sentence aesthetic description of this sonic journey",
  "genreTags": ["tag1", "tag2", "tag3"],
  "mood": "e.g. Atmospheric / High Energy / Late Night",
  "songs": [
    { "title": "Song Title", "artist": "Artist Name" }
  ]
}`;

        const rawJson = await this.callLLM(promptText, "You are a professional music programmer and Spotify playlist curator. Output valid JSON only, no markdown backticks, no preamble.");

        let parsed = null;
        if (rawJson) {
            try {
                const clean = rawJson.replace(/```json/gi, "").replace(/```/g, "").trim();
                parsed = JSON.parse(clean);
            } catch (e) {
                console.warn("Failed to parse LLM JSON for playlist, falling back to smart generation", e.message);
            }
        }

        if (!parsed || !parsed.songs || parsed.songs.length === 0) {
            parsed = {
                title: `${prompt.slice(0, 30)} (Audix AI Mix)`,
                description: `A custom AI-curated sonic landscape inspired by: "${prompt}". Tailored for your personal music taste.`,
                genreTags: ["Curated", "Alternative", "Electronic", "Vibes"],
                mood: "Dynamic Discovery",
                songs: [
                    { title: "Starboy", artist: "The Weeknd" },
                    { title: "Midnight City", artist: "M83" },
                    { title: "Breathe Deeper", artist: "Tame Impala" },
                    { title: "Do I Wanna Know?", artist: "Arctic Monkeys" },
                    { title: "After Hours", artist: "The Weeknd" },
                    { title: "Let It Happen", artist: "Tame Impala" },
                    { title: "Heroes", artist: "David Bowie" },
                    { title: "The Less I Know The Better", artist: "Tame Impala" },
                    { title: "Chamber of Reflection", artist: "Mac DeMarco" },
                    { title: "Instant Crush", artist: "Daft Punk" },
                    { title: "Somebody Else", artist: "The 1975" },
                    { title: "Reflections", artist: "The Neighbourhood" }
                ]
            };
        }

        // Verify each track on Spotify Search
        const verifiedTracks = [];
        for (const item of parsed.songs) {
            try {
                const query = `${item.title} ${item.artist}`;
                const searchRes = await spotifyService.search(user, query, { types: ["track"], limit: 1 });
                const track = searchRes?.tracks?.items?.[0];
                if (track) {
                    verifiedTracks.push({
                        spotifyId: track.id,
                        name: track.name,
                        artist: track.artists.map(a => a.name).join(", "),
                        album: track.album?.name || "",
                        albumCover: track.album?.images?.[0]?.url || "",
                        durationMs: track.duration_ms,
                        uri: track.uri,
                        previewUrl: track.preview_url || ""
                    });
                }
            } catch (err) {
                // Skip track on error
            }
        }

        const generatedPlaylist = await GeneratedPlaylist.create({
            userId: user.spotifyId,
            prompt,
            title: parsed.title,
            description: parsed.description,
            genreTags: parsed.genreTags || [],
            mood: parsed.mood || "Curated",
            tracks: verifiedTracks
        });

        return generatedPlaylist;
    }

    /**
     * Save generated playlist directly into user's Spotify account
     */
    async savePlaylistToSpotify(user, generatedPlaylistId) {
        const playlistRecord = await GeneratedPlaylist.findOne({
            _id: generatedPlaylistId,
            userId: user.spotifyId
        });

        if (!playlistRecord) {
            throw new Error("Generated playlist not found or unauthorized");
        }

        if (playlistRecord.isSavedToSpotify && playlistRecord.spotifyPlaylistUrl) {
            return {
                success: true,
                alreadySaved: true,
                spotifyPlaylistId: playlistRecord.spotifyPlaylistId,
                spotifyPlaylistUrl: playlistRecord.spotifyPlaylistUrl
            };
        }

        // 1. Create playlist on Spotify
        const createdSpotifyPlaylist = await spotifyService.createPlaylist(user, {
            name: playlistRecord.title,
            description: `${playlistRecord.description || ""} — Generated with Audix AI`,
            isPublic: false
        });

        // 2. Add tracks
        const uris = playlistRecord.tracks.map(t => t.uri).filter(Boolean);
        if (uris.length > 0) {
            await spotifyService.addTracksToPlaylist(user, createdSpotifyPlaylist.id, uris);
        }

        // 3. Update DB record
        playlistRecord.isSavedToSpotify = true;
        playlistRecord.spotifyPlaylistId = createdSpotifyPlaylist.id;
        playlistRecord.spotifyPlaylistUrl = createdSpotifyPlaylist.external_urls?.spotify || "";
        await playlistRecord.save();

        return {
            success: true,
            spotifyPlaylistId: createdSpotifyPlaylist.id,
            spotifyPlaylistUrl: playlistRecord.spotifyPlaylistUrl,
            trackCount: uris.length
        };
    }

    /**
     * AI Music Taste Analysis
     */
    async generateTasteAnalysis(user) {
        const [topArtistsRes, topTracksRes] = await Promise.all([
            spotifyService.getTopArtists(user, { limit: 25, time_range: "medium_term" }).catch(() => ({ items: [] })),
            spotifyService.getTopTracks(user, { limit: 30, time_range: "medium_term" }).catch(() => ({ items: [] }))
        ]);

        const artists = topArtistsRes.items || [];
        const tracks = topTracksRes.items || [];

        // Compute genre counts
        const genreMap = {};
        artists.forEach(a => {
            (a.genres || []).forEach(g => {
                genreMap[g] = (genreMap[g] || 0) + 1;
            });
        });

        const sortedGenres = Object.entries(genreMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([genre, count]) => ({ genre, count }));

        // Compute popularity metrics
        const avgPopularity = tracks.length
            ? Math.round(tracks.reduce((acc, t) => acc + (t.popularity || 0), 0) / tracks.length)
            : 65;

        const obscurityScore = Math.max(0, 100 - avgPopularity);

        // Prompt LLM for Personality Archetype & Report
        const artistSummary = artists.slice(0, 10).map(a => `${a.name} (${(a.genres || []).slice(0, 2).join(",")})`).join("; ");
        const trackSummary = tracks.slice(0, 10).map(t => `"${t.name}"`).join(", ");

        const prompt = `Analyze this Spotify listener's sonic DNA:
Top Artists: ${artistSummary || "Modern rock, indie pop, electro-r&b"}
Top Tracks: ${trackSummary || "Atmospheric and energetic favorites"}
Top Genres: ${sortedGenres.map(g => g.genre).slice(0, 6).join(", ")}
Mainstream Popularity Score: ${avgPopularity}/100 (Obscurity: ${obscurityScore}/100)

Provide a rich JSON response with:
{
  "personalityArchetype": "e.g. The Atmospheric Sonic Explorer",
  "summary": "2-3 sentences poetically describing their musical soul and listening philosophy",
  "dominantMoods": ["Nocturnal", "Contemplative", "Euphoric"],
  "acousticAesthetic": "e.g. Lush synthesizers blended with driving basslines and raw lyrical delivery",
  "recommendedExploration": "One unique genre or subculture they would love exploring next"
}`;

        const rawJson = await this.callLLM(prompt, "You are an elite musicologist and sonic psychoanalyst. Return valid JSON only.");

        let analysis = null;
        if (rawJson) {
            try {
                const clean = rawJson.replace(/```json/gi, "").replace(/```/g, "").trim();
                analysis = JSON.parse(clean);
            } catch (e) {
                console.warn("Failed to parse taste analysis JSON from LLM", e.message);
            }
        }

        if (!analysis) {
            analysis = {
                personalityArchetype: "The Atmospheric Sonic Explorer",
                summary: "Your listening taste thrives on rich sonic textures, immersive moodscapes, and dynamic melodies. You balance mainstream chart-toppers with deep-cut indie discoveries, creating a versatile soundtrack that moves effortlessly from late-night introspection to high-energy rhythm.",
                dominantMoods: ["Nocturnal", "Introspective", "Cinematic", "Rhythmic"],
                acousticAesthetic: "Echoing reverb, melodic synthesizer layers, and magnetic rhythm sections.",
                recommendedExploration: "French Touch Synthwave and Neo-Psychedelic Dream Pop"
            };
        }

        return {
            archetype: analysis.personalityArchetype,
            summary: analysis.summary,
            dominantMoods: analysis.dominantMoods || ["Vibrant", "Melodic"],
            aesthetic: analysis.acousticAesthetic,
            recommendedExploration: analysis.recommendedExploration,
            topGenres: sortedGenres,
            avgPopularity,
            obscurityScore,
            favoriteArtists: artists.slice(0, 6).map(a => ({
                id: a.id,
                name: a.name,
                image: a.images?.[0]?.url,
                genres: a.genres?.slice(0, 3) || []
            })),
            favoriteTracks: tracks.slice(0, 6).map(t => ({
                id: t.id,
                name: t.name,
                artist: t.artists.map(a => a.name).join(", "),
                image: t.album?.images?.[0]?.url,
                durationMs: t.duration_ms
            }))
        };
    }

    /**
     * Get chat history for user
     */
    async getChatHistory(user, limit = 40) {
        return await ChatMessage.find({ userId: user.spotifyId })
            .sort({ createdAt: 1 })
            .limit(limit);
    }
}

export default new AIService();
