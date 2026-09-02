using System.Collections.Generic;
using UnityEngine;
using ZonaTRunner.Core;

namespace ZonaTRunner.World
{
    public class TrackSpawner : MonoBehaviour
    {
        [Header("Track Configuration")]
        [SerializeField] private GameObject[] trackSegmentPrefabs;
        [SerializeField] private Transform playerTransform;
        [SerializeField] private float segmentLength = 30f;
        [SerializeField] private int initialSegments = 6;
        [SerializeField] private float despawnDistance = 45f;

        private readonly List<GameObject> activeSegments = new List<GameObject>();
        private float nextSpawnZ = 0f;

        private void Start()
        {
            if (playerTransform == null)
            {
                GameObject player = GameObject.FindGameObjectWithTag("Player");
                if (player != null) playerTransform = player.transform;
            }

            // Spawn initial safe stretch
            for (int i = 0; i < initialSegments; i++)
            {
                SpawnSegment(i < 2); // First 2 segments are flat & obstacle-free
            }
        }

        private void Update()
        {
            if (playerTransform == null) return;

            // Spawn new segment forward
            if (playerTransform.position.z + (initialSegments * segmentLength * 0.5f) > nextSpawnZ)
            {
                SpawnSegment(false);
            }

            // Recycle past segments behind camera
            if (activeSegments.Count > 0)
            {
                GameObject oldestSegment = activeSegments[0];
                if (playerTransform.position.z - oldestSegment.transform.position.z > despawnDistance)
                {
                    activeSegments.RemoveAt(0);
                    Destroy(oldestSegment); // Can be replaced by ObjectPool once prefabs are authored
                }
            }
        }

        private void SpawnSegment(bool isSafeZone)
        {
            if (trackSegmentPrefabs == null || trackSegmentPrefabs.Length == 0)
                return;

            int index = isSafeZone ? 0 : Random.Range(0, trackSegmentPrefabs.Length);
            GameObject prefab = trackSegmentPrefabs[index];

            Vector3 spawnPos = new Vector3(0f, 0f, nextSpawnZ);
            GameObject newSegment = Instantiate(prefab, spawnPos, Quaternion.identity, transform);

            activeSegments.Add(newSegment);
            nextSpawnZ += segmentLength;
        }
    }
}
