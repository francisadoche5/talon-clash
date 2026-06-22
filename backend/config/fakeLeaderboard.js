// Fake (placeholder) leaderboard entries — keeps the Leaderboard screen feeling
// alive while the real player base is small. These are NOT real accounts: no
// telegram auth, no rows in the players table, nothing real users can interact
// with. They only exist inside getLeaderboard() in modules/players, merged in
// alongside real players and sorted by Glory like everyone else.
//
// Why this 'cancels itself out' automatically as real users show up:
// because the merge is just "combine + sort by glory", a real player who earns
// more Glory than a given fake entry will naturally rank above it and push it
// down/out of whatever slice (top 50/100) is being displayed — no manual
// cleanup, feature flag, or migration needed. Once your real player base
// outgrows this list, simply delete this file and remove its one import in
// modules/players/index.js.
const FAKE_LEADERBOARD_PLAYERS = [
  { telegram_id: "fakebot_001", display_name: "mike113", username: "mike113", glory: 147952, evolution_tier: 7, isFake: true },
  { telegram_id: "fakebot_002", display_name: "joy153", username: "joy153", glory: 135869, evolution_tier: 7, isFake: true },
  { telegram_id: "fakebot_003", display_name: "alex193", username: "alex193", glory: 124684, evolution_tier: 7, isFake: true },
  { telegram_id: "fakebot_004", display_name: "sam233", username: "sam233", glory: 114510, evolution_tier: 7, isFake: true },
  { telegram_id: "fakebot_005", display_name: "leo273", username: "leo273", glory: 105077, evolution_tier: 7, isFake: true },
  { telegram_id: "fakebot_006", display_name: "mia313", username: "mia313", glory: 96511, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_007", display_name: "kira353", username: "kira353", glory: 88555, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_008", display_name: "jax393", username: "jax393", glory: 81345, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_009", display_name: "nina433", username: "nina433", glory: 74633, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_010", display_name: "ray473", username: "ray473", glory: 68565, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_011", display_name: "luna513", username: "luna513", glory: 62902, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_012", display_name: "finn553", username: "finn553", glory: 57700, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_013", display_name: "zara593", username: "zara593", glory: 53018, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_014", display_name: "theo633", username: "theo633", glory: 48627, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_015", display_name: "ava673", username: "ava673", glory: 44689, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_016", display_name: "kai713", username: "kai713", glory: 40982, evolution_tier: 6, isFake: true },
  { telegram_id: "fakebot_017", display_name: "ruby753", username: "ruby753", glory: 37672, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_018", display_name: "dante793", username: "dante793", glory: 34541, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_019", display_name: "skye833", username: "skye833", glory: 31760, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_020", display_name: "milo873", username: "milo873", glory: 29114, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_021", display_name: "nova913", username: "nova913", glory: 26779, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_022", display_name: "jett953", username: "jett953", glory: 24543, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_023", display_name: "ivy993", username: "ivy993", glory: 22486, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_024", display_name: "wade1033", username: "wade1033", glory: 20691, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_025", display_name: "tess173", username: "tess173", glory: 18951, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_026", display_name: "cole213", username: "cole213", glory: 17447, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_027", display_name: "raven253", username: "raven253", glory: 15974, evolution_tier: 5, isFake: true },
  { telegram_id: "fakebot_028", display_name: "ash293", username: "ash293", glory: 14715, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_029", display_name: "blaze333", username: "blaze333", glory: 13466, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_030", display_name: "wren373", username: "wren373", glory: 12413, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_031", display_name: "storm413", username: "storm413", glory: 11354, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_032", display_name: "echo453", username: "echo453", glory: 10475, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_033", display_name: "drake493", username: "drake493", glory: 9576, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_034", display_name: "sage533", username: "sage533", glory: 8747, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_035", display_name: "onyx573", username: "onyx573", glory: 8079, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_036", display_name: "frost613", username: "frost613", glory: 7373, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_037", display_name: "talon653", username: "talon653", glory: 6818, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_038", display_name: "hawk693", username: "hawk693", glory: 6217, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_039", display_name: "viper733", username: "viper733", glory: 5758, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_040", display_name: "rex773", username: "rex773", glory: 5244, evolution_tier: 4, isFake: true },
  { telegram_id: "fakebot_041", display_name: "kyo813", username: "kyo813", glory: 4865, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_042", display_name: "zane853", username: "zane853", glory: 4425, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_043", display_name: "luca893", username: "luca893", glory: 4115, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_044", display_name: "nyx933", username: "nyx933", glory: 3737, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_045", display_name: "felix973", username: "felix973", glory: 3386, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_046", display_name: "juno1013", username: "juno1013", glory: 3158, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_047", display_name: "orin1053", username: "orin1053", glory: 2856, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_048", display_name: "cassius1093", username: "cassius1093", glory: 2672, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_049", display_name: "vega1133", username: "vega1133", glory: 2410, evolution_tier: 3, isFake: true },
  { telegram_id: "fakebot_050", display_name: "pax273", username: "pax273", glory: 2263, evolution_tier: 3, isFake: true },
];

module.exports = { FAKE_LEADERBOARD_PLAYERS };
