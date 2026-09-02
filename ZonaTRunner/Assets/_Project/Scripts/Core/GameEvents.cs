using System;

namespace ZonaTRunner.Core
{
    public enum GameState
    {
        Boot,
        MainMenu,
        DJSelect,
        ReadyToRun,
        Running,
        Paused,
        GameOver,
        Reviving
    }

    public static class GameEvents
    {
        // Game state events
        public static event Action<GameState> OnGameStateChanged;
        public static event Action OnRunStarted;
        public static event Action<int, float> OnGameOver; // finalScore, distanceMeters
        public static event Action OnRunRestarted;

        // DJ & Experience events
        public static event Action<string> OnDJSelected; // djId
        public static event Action<string> OnWorldLoaded; // worldThemeId

        // Player gameplay events
        public static event Action<int> OnLaneChanged; // laneIndex (-1, 0, 1)
        public static event Action OnPlayerJumped;
        public static event Action OnPlayerSlid;
        public static event Action OnPlayerHitObstacle;

        // Score & Collectibles events
        public static event Action<int> OnScoreUpdated;
        public static event Action<int> OnCoinsCollected; // amount
        public static event Action<int> OnMultiplierChanged; // currentMultiplier

        // Promotions & Native Ads events
        public static event Action<string> OnPromotionImpression; // promoId
        public static event Action<string> OnPromotionClicked; // promoId

        // Invocations
        public static void TriggerGameStateChanged(GameState newState) => OnGameStateChanged?.Invoke(newState);
        public static void TriggerRunStarted() => OnRunStarted?.Invoke();
        public static void TriggerGameOver(int finalScore, float distance) => OnGameOver?.Invoke(finalScore, distance);
        public static void TriggerRunRestarted() => OnRunRestarted?.Invoke();
        public static void TriggerDJSelected(string djId) => OnDJSelected?.Invoke(djId);
        public static void TriggerWorldLoaded(string worldId) => OnWorldLoaded?.Invoke(worldId);
        public static void TriggerLaneChanged(int lane) => OnLaneChanged?.Invoke(lane);
        public static void TriggerPlayerJumped() => OnPlayerJumped?.Invoke();
        public static void TriggerPlayerSlid() => OnPlayerSlid?.Invoke();
        public static void TriggerPlayerHitObstacle() => OnPlayerHitObstacle?.Invoke();
        public static void TriggerScoreUpdated(int score) => OnScoreUpdated?.Invoke(score);
        public static void TriggerCoinsCollected(int amount) => OnCoinsCollected?.Invoke(amount);
        public static void TriggerMultiplierChanged(int mult) => OnMultiplierChanged?.Invoke(mult);
        public static void TriggerPromotionImpression(string promoId) => OnPromotionImpression?.Invoke(promoId);
        public static void TriggerPromotionClicked(string promoId) => OnPromotionClicked?.Invoke(promoId);
    }
}
