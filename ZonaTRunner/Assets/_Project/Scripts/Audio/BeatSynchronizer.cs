using System;
using UnityEngine;

namespace ZonaTRunner.Audio
{
    public class BeatSynchronizer : MonoBehaviour
    {
        public static BeatSynchronizer Instance { get; private set; }

        [Header("Audio Settings")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private float bpm = 128f;
        [SerializeField] private float firstBeatOffset = 0f;

        public static event Action OnQuarterBeat;
        public static event Action OnBarBeat; // Every 4 quarter beats

        private double dspSongStartTime;
        private double secondsPerBeat;
        private int lastBeatCount = -1;

        public float BPM => bpm;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (audioSource == null)
            {
                audioSource = GetComponent<AudioSource>();
            }
        }

        public void SetTrack(AudioClip clip, float newBpm, float offset = 0f)
        {
            bpm = newBpm;
            firstBeatOffset = offset;
            secondsPerBeat = 60.0 / bpm;

            if (audioSource != null && clip != null)
            {
                audioSource.clip = clip;
                dspSongStartTime = AudioSettings.dspTime + 0.1;
                audioSource.PlayScheduled(dspSongStartTime);
            }
        }

        private void Update()
        {
            if (audioSource == null || !audioSource.isPlaying) return;

            // Accurate sub-millisecond audio clock calculation
            double songPosition = AudioSettings.dspTime - dspSongStartTime - firstBeatOffset;
            if (songPosition < 0) return;

            int currentBeat = (int)(songPosition / secondsPerBeat);

            if (currentBeat > lastBeatCount)
            {
                lastBeatCount = currentBeat;
                OnQuarterBeat?.Invoke();

                if (currentBeat % 4 == 0)
                {
                    OnBarBeat?.Invoke();
                }
            }
        }
    }
}
