using UnityEngine;

namespace ZonaTRunner.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Runtime State")]
        [SerializeField] private GameState currentState = GameState.Boot;
        [SerializeField] private string selectedDJId = "dj_fresar";

        [Header("Run Tracking")]
        [SerializeField] private float currentDistance = 0f;
        [SerializeField] private int currentScore = 0;
        [SerializeField] private int currentCoins = 0;
        [SerializeField] private int currentMultiplier = 1;
        [SerializeField] private float runSpeed = 12f;
        [SerializeField] private float maxRunSpeed = 28f;
        [SerializeField] private float speedIncreaseRate = 0.1f;

        public GameState CurrentState => currentState;
        public string SelectedDJId => selectedDJId;
        public float RunSpeed => runSpeed;
        public int CurrentScore => currentScore;
        public int CurrentCoins => currentCoins;
        public float CurrentDistance => currentDistance;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            SetState(GameState.MainMenu);
        }

        private void Update()
        {
            if (currentState == GameState.Running)
            {
                // Speed progression over time
                if (runSpeed < maxRunSpeed)
                {
                    runSpeed += speedIncreaseRate * Time.deltaTime;
                }

                // Distance & basic score calculation
                float deltaDistance = runSpeed * Time.deltaTime;
                currentDistance += deltaDistance;
                currentScore += Mathf.RoundToInt(deltaDistance * currentMultiplier);

                GameEvents.TriggerScoreUpdated(currentScore);
            }
        }

        public void SetState(GameState newState)
        {
            if (currentState == newState) return;

            currentState = newState;
            GameEvents.TriggerGameStateChanged(newState);

            switch (newState)
            {
                case GameState.Running:
                    Time.timeScale = 1f;
                    break;
                case GameState.Paused:
                case GameState.GameOver:
                    Time.timeScale = 0f;
                    break;
            }
        }

        public void SelectDJ(string djId)
        {
            selectedDJId = djId;
            GameEvents.TriggerDJSelected(djId);
        }

        public void StartRun()
        {
            currentDistance = 0f;
            currentScore = 0;
            currentCoins = 0;
            currentMultiplier = 1;
            runSpeed = 12f;

            SetState(GameState.Running);
            GameEvents.TriggerRunStarted();
        }

        public void EndRun()
        {
            SetState(GameState.GameOver);
            GameEvents.TriggerGameOver(currentScore, currentDistance);
        }

        public void AddCoins(int amount)
        {
            currentCoins += amount;
            GameEvents.TriggerCoinsCollected(amount);
        }

        public void SetMultiplier(int multiplier)
        {
            currentMultiplier = Mathf.Max(1, multiplier);
            GameEvents.TriggerMultiplierChanged(currentMultiplier);
        }
    }
}
