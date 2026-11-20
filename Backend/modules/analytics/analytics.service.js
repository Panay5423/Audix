import spotifyService from "../spotify/spotify.service.js";

class AnalyticsService {
    async getUserAnalytics(user, { time_range = "medium_term" } = {}) {
        const [topTracksRes, topArtistsRes, recentlyPlayedRes, playlistsRes, savedTracksRes] = await Promise.all([
            spotifyService.getTopTracks(user, { limit: 50, time_range }).catch(() => ({ items: [] })),
            spotifyService.getTopArtists(user, { limit: 50, time_range }).catch(() => ({ items: [] })),
            spotifyService.getRecentlyPlayed(user, { limit: 50 }).catch(() => ({ items: [] })),
            spotifyService.getUserPlaylists(user, { limit: 50 }).catch(() => ({ total: 0 })),
            spotifyService.getSavedTracks(user, { limit: 1 }).catch(() => ({ total: 0 }))
        ]);

        const tracks = topTracksRes.items || [];
        const artists = topArtistsRes.items || [];
        const recent = recentlyPlayedRes.items || [];

        // 1. Genre breakdown
        const genreCounts = {};
        artists.forEach(a => {
            (a.genres || []).forEach(g => {
                genreCounts[g] = (genreCounts[g] || 0) + 1;
            });
        });

        const totalGenreHits = Object.values(genreCounts).reduce((a, b) => a + b, 0) || 1;
        const topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({
                name,
                count,
                percentage: Math.round((count / totalGenreHits) * 100)
            }));

        // 2. Decades breakdown from release dates
        const decadeCounts = {};
        tracks.forEach(t => {
            const releaseYear = t.album?.release_date ? parseInt(t.album.release_date.slice(0, 4), 10) : null;
            if (releaseYear) {
                const decade = Math.floor(releaseYear / 10) * 10;
                const label = `${decade}s`;
                decadeCounts[label] = (decadeCounts[label] || 0) + 1;
            }
        });

        const totalDecades = Object.values(decadeCounts).reduce((a, b) => a + b, 0) || 1;
        const decades = Object.entries(decadeCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([decade, count]) => ({
                decade,
                count,
                percentage: Math.round((count / totalDecades) * 100)
            }));

        // 3. Popularity Distribution
        const popularities = tracks.map(t => t.popularity || 0);
        const avgPopularity = popularities.length
            ? Math.round(popularities.reduce((a, b) => a + b, 0) / popularities.length)
            : 50;

        const mainstreamCount = popularities.filter(p => p >= 70).length;
        const midTierCount = popularities.filter(p => p >= 40 && p < 70).length;
        const undergroundCount = popularities.filter(p => p < 40).length;

        // 4. Listening Velocity & Repetition in recently played
        const recentTrackIds = recent.map(r => r.track?.id).filter(Boolean);
        const uniqueRecentIds = new Set(recentTrackIds);
        const repeatRate = recentTrackIds.length
            ? Math.round(((recentTrackIds.length - uniqueRecentIds.size) / recentTrackIds.length) * 100)
            : 0;

        return {
            timeRange: time_range,
            totalTracksAnalyzed: tracks.length,
            totalArtistsAnalyzed: artists.length,
            totalSavedTracks: savedTracksRes.total || 0,
            totalPlaylists: playlistsRes.total || 0,
            avgPopularity,
            obscurityScore: Math.max(0, 100 - avgPopularity),
            popularityTiers: {
                mainstream: mainstreamCount,
                midTier: midTierCount,
                underground: undergroundCount
            },
            repeatRatePercentage: repeatRate,
            topGenres,
            decades,
            topArtistsPreview: artists.slice(0, 5).map(a => ({
                id: a.id,
                name: a.name,
                followers: a.followers?.total,
                image: a.images?.[0]?.url,
                popularity: a.popularity
            })),
            topTracksPreview: tracks.slice(0, 5).map(t => ({
                id: t.id,
                name: t.name,
                artist: t.artists.map(a => a.name).join(", "),
                album: t.album?.name,
                image: t.album?.images?.[0]?.url,
                durationMs: t.duration_ms,
                popularity: t.popularity
            }))
        };
    }
}

export default new AnalyticsService();
